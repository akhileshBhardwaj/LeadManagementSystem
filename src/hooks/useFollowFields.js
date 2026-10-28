import { useState } from "react";
import { isPastDate } from "../utils/date";

const EMPTY_FOLLOW = {
  nextDate: "",
  time: "",
  person: "",
  mobile: "",
  location: "",
  note: "",
};

// Inline follow-up section used when a lead is saved with status "postponed".
export function useFollowFields() {
  const [follow, setFollow] = useState(EMPTY_FOLLOW);
  const [errors, setErrors] = useState({});

  const setFollowField = (key) => (event) => {
    const { value } = event.target;
    setFollow((prev) => ({ ...prev, [key]: value }));
  };

  const syncForStatus = (status, lead) => {
    if (status !== "postponed") {
      setFollow(EMPTY_FOLLOW);
      setErrors({});
      return;
    }
    setFollow((prev) => ({
      ...prev,
      person: prev.person || lead.name.trim(),
      mobile: prev.mobile || lead.phone.trim(),
      location: prev.location || lead.location.trim(),
    }));
  };

  const validate = () => {
    const next = {};
    if (!follow.nextDate) next.nextDate = "Next follow-up date is required";
    else if (isPastDate(follow.nextDate))
      next.nextDate = "Date cannot be in the past";
    if (!follow.time) next.time = "Time is required";
    if (!follow.person.trim()) next.person = "Person is required";
    if (follow.mobile && !/^\d{10}$/.test(follow.mobile.trim()))
      next.mobile = "Mobile number must be 10 digits";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildResponse = () => ({
    type: "postponed",
    nextDate: follow.nextDate,
    time: follow.time,
    person: follow.person.trim(),
    mobile: follow.mobile.trim(),
    location: follow.location.trim(),
    note: follow.note.trim() || "Marked postponed while adding lead.",
    createdAt: new Date().toISOString(),
  });

  return {
    follow,
    errors,
    setFollowField,
    syncForStatus,
    validate,
    buildResponse,
  };
}
