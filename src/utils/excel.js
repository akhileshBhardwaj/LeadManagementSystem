import { STATUS_OPTIONS } from "../data/constants";

const REFERENCES = ["Ads", "Local Banner", "Cold Calling", "Google"];

const COLUMNS = {
  name: [
    "name",
    "studentname",
    "leadname",
    "contactname",
    "contactperson",
    "candidate",
    "candidatename",
  ],
  phone: [
    "phone",
    "phone1",
    "phone1primary",
    "primaryphone",
    "primarymobile",
    "mobile",
    "mobileno",
    "phoneno",
    "contact",
    "contactno",
  ],
  phone2: [
    "phone2",
    "phone2alternateoptional",
    "alternatephone",
    "alternatemobile",
    "secondaryphone",
    "secondarymobile",
  ],
  course: [
    "course",
    "coursename",
    "product",
    "position",
    "jobrole",
    "role",
    "service",
    "services",
    "coursepositionservice",
  ],
  location: ["location", "city", "area"],
  budgetMin: ["budgetmin", "budgetminimum", "minbudget", "min"],
  budgetMax: ["budgetmax", "budgetmaximum", "maxbudget", "max"],
  reference: ["reference", "source", "leadsource"],
  status: ["status"],
};

const clean = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function pick(row, keys) {
  for (const k of Object.keys(row)) {
    if (keys.includes(clean(k))) return row[k];
  }
  return "";
}

function cleanPhone(value) {
  let p = String(value).replace(/\D/g, "");
  if (p.length === 12 && p.startsWith("91")) p = p.slice(2);
  if (p.length === 11 && p.startsWith("0")) p = p.slice(1);
  return p;
}

function toNumber(value) {
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function parseLeadsFile(file, existingPhones = []) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  const seen = new Set(existingPhones.map(cleanPhone).filter(Boolean));

  return raw
    .filter((r) => Object.values(r).some((v) => String(v).trim() !== ""))
    .map((r, i) => {
      const errors = [];
      const name = String(pick(r, COLUMNS.name)).trim();
      const phone = cleanPhone(pick(r, COLUMNS.phone));
      const phone2 = cleanPhone(pick(r, COLUMNS.phone2));
      const budgetMin = toNumber(pick(r, COLUMNS.budgetMin));
      const budgetMax = toNumber(pick(r, COLUMNS.budgetMax));
      const refText = String(pick(r, COLUMNS.reference)).trim();
      const statusText = String(pick(r, COLUMNS.status)).trim().toLowerCase();

      const reference = refText
        ? REFERENCES.find((x) => x.toLowerCase() === refText.toLowerCase()) ||
          "Google"
        : "Google";
      const status = statusText || "active";

      if (!name) errors.push("Name missing");
      if (!/^\d{10}$/.test(phone)) errors.push("Phone must be 10 digits");
      if (phone2 && !/^\d{10}$/.test(phone2))
        errors.push("Phone 2 must be 10 digits");
      if (phone2 && phone2 === phone)
        errors.push("Phone 2 must be different from Phone 1");
      if (budgetMax > 0 && budgetMax < budgetMin)
        errors.push("Budget max is less than min");
      if (!STATUS_OPTIONS.includes(status))
        errors.push(`Unknown status: ${statusText}`);

      const duplicate =
        !errors.length &&
        [phone, phone2].filter(Boolean).some((number) => seen.has(number));
      if (phone) seen.add(phone);
      if (phone2) seen.add(phone2);

      return {
        row: i + 2,
        errors,
        duplicate,
        data: {
          name,
          phone,
          phone2,
          course: String(pick(r, COLUMNS.course)).trim(),
          location: String(pick(r, COLUMNS.location)).trim(),
          budgetMin,
          budgetMax,
          reference,
          status,
        },
      };
    });
}

export async function downloadTemplate(itemLabel = "Position") {
  const XLSX = await import("xlsx");
  const rows = [
    [
      "Name",
      "Phone",
      itemLabel,
      "Location",
      "Budget Min",
      "Budget Max",
      "Reference",
      "Status",
    ],
    [
      "Rahul Sharma",
      "9876543210",
      `Senior ${itemLabel}`,
      "Lucknow",
      15000,
      25000,
      "Ads",
      "active",
    ],
    [
      "Priya Singh",
      "9123456780",
      `Associate ${itemLabel}`,
      "Kanpur",
      10000,
      18000,
      "Google",
      "postponed",
    ],
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Leads");
  XLSX.writeFile(
    wb,
    `${itemLabel.toLowerCase().replace(/\s+/g, "-")}-leads-template.xlsx`,
  );
}

// Exports only the leads of the active department.
export async function downloadLeads(leads, fileName = "leads") {
  const XLSX = await import("xlsx");
  const rows = [
    [
      "Name",
      "Phone 1",
      "Phone 2",
      "Course / Position / Service",
      "Location",
      "Budget Min",
      "Budget Max",
      "Reference",
      "Status",
      "Created On",
    ],
    ...leads.map((lead) => [
      lead.name || "",
      lead.phone || "",
      lead.phone2 || "",
      lead.course || "",
      lead.location || "",
      Number(lead.budgetMin) || 0,
      Number(lead.budgetMax) || 0,
      lead.reference || "",
      lead.status || "",
      lead.createdAt ? String(lead.createdAt).slice(0, 10) : "",
    ]),
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Leads");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
