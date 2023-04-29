import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

function DateRangePicker() {
  const [loading, setLoading] = useState(false);
  const [selectedDateStart, setSelectedDateStart] = useState(new Date(2022, 9, 1));
  const [selectedDateEnd, setSelectedDateEnd] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState("range");

  const handleStartDateChange = (e) => {
    const date = e.target.value;
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setLoading(true);
    setSelectedDateStart(firstDayOfMonth);
    buildDataTable();
  };

  const handleEndDateChange = (e) => {
    const date = e.target.value;
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    setLoading(true);
    setSelectedDateEnd(lastDayOfMonth);
    buildDataTable();
  };

  const buildDataTable = async () => {
    await getEmpresas();
    setLoading(false);
  };

  const getEmpresas = async () => {
    // logic for fetching empresas data
  };

  const handleCalendarModeChange = (event) => {
    const newCalendarMode = calendarMode === "single" ? "range" : "single";
    setCalendarMode(newCalendarMode);
  };

  const calendarIcons = {
    single: {
      icon: "pi pi-calendar",
      ariaLabel: "Single date selection mode",
    },
    range: {
      icon: "pi pi-calendar-times",
      ariaLabel: "Date range selection mode",
    },
  };

  return (
    <div className="flex gap-2">
      <Calendar
        minDate={new Date(2022, 9, 1)}
        maxDate={selectedDateEnd}
        style={{ width: "9rem" }}
        disabled={loading}
        value={selectedDateStart}
        view="month"
        dateFormat="MM yy"
        onChange={handleStartDateChange}
      />
      <Button
        icon={calendarIcons[calendarMode].icon}
        disabled={loading}
        className="p-button-help p-button-outlined"
        onClick={handleCalendarModeChange}
        aria-controls="popup_menu"
        aria-label={calendarIcons[calendarMode].ariaLabel}
      />
      {calendarMode === "range" && (
        <Calendar
          maxDate={new Date()}
          minDate={selectedDateStart}
          style={{ width: "9rem" }}
          disabled={loading}
          value={selectedDateEnd}
          view="month"
          dateFormat="MM yy"
          onChange={handleEndDateChange}
        />
      )}
    </div>
  );
}

export default DateRangePicker;
