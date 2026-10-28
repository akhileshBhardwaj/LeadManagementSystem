import { useState } from "react";
import Button from "../ui/Button";
import { useLeads } from "../../context/LeadContext";
import { LEAD_CONFIG } from "../../data/constants";
import { parseLeadsFile, downloadTemplate } from "../../utils/excel";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ImportLeads({ departmentId, onDone }) {
  const { getLeadsByDepartment, importLeads } = useLeads();
  const itemLabel = LEAD_CONFIG.itemLabel;

  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const valid = rows.filter((r) => !r.errors.length && !r.duplicate);
  const errors = rows.filter((r) => r.errors.length);
  const dups = rows.filter((r) => r.duplicate);

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setRows([]);
    setFileName(file.name);
    if (file.size > 5 * 1024 * 1024) {
      setError("File is larger than 5 MB");
      return;
    }
    try {
      // The duplicate check only compares against this department's phones.
      const existingPhones = getLeadsByDepartment(departmentId).flatMap(
        (lead) => [lead.phone, lead.phone2].filter(Boolean),
      );
      const parsed = await parseLeadsFile(file, existingPhones);
      if (!parsed.length) setError("No rows found in this file");
      setRows(parsed);
    } catch {
      setError("Could not read this file. Use .xlsx, .xls or .csv");
    }
    // same file dobara chunne par bhi onChange chale
    event.target.value = "";
  };

  const submit = () => {
    importLeads(
      departmentId,
      valid.map((r) => r.data),
    );
    onDone?.();
  };

  const headers = [
    "Row",
    "Name",
    "Phone",
    itemLabel,
    "Location",
    "Budget",
    "Reference",
    "Status",
    "Result",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-border bg-page p-4">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onFile}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-on-primary"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => downloadTemplate(itemLabel)}
        >
          Download template ({itemLabel})
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {rows.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-surface-muted px-3 py-1">
              Total {rows.length}
            </span>
            <span className="rounded-full bg-success-soft px-3 py-1 text-success">
              Valid {valid.length}
            </span>
            <span className="rounded-full bg-danger-soft px-3 py-1 text-danger">
              Errors {errors.length}
            </span>
            <span className="rounded-full bg-warning-soft px-3 py-1 text-warning">
              Duplicates {dups.length}
            </span>
            {fileName && (
              <span className="ml-auto truncate text-text-muted">
                {fileName}
              </span>
            )}
          </div>

          <div className="max-h-64 overflow-auto rounded-2xl border border-border">
            <table className="data-table w-full min-w-215 text-left text-sm">
              <thead className="sticky top-0 bg-table-head text-table-head-text text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r) => (
                  <tr key={r.row} className="data-row">
                    <td className="px-3 py-2 text-text-muted">{r.row}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-text-strong">
                      {r.data.name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {r.data.phone || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {r.data.course || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {r.data.location || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {money(r.data.budgetMin)} - {money(r.data.budgetMax)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {r.data.reference || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 capitalize">
                      {r.data.status || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {r.errors.length ? (
                        <span className="text-danger">
                          {r.errors.join(", ")}
                        </span>
                      ) : r.duplicate ? (
                        <span className="text-warning">Duplicate, skipped</span>
                      ) : (
                        <span className="text-success">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && (
            <p className="text-xs text-text-muted">
              Showing first 50 rows. All valid rows will be imported into this
              department.
            </p>
          )}

          <div className="sticky bottom-0 -mx-1 flex justify-end border-t border-border bg-surface px-1 pb-1 pt-3">
            <Button onClick={submit} disabled={!valid.length}>
              Import {valid.length} leads
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
