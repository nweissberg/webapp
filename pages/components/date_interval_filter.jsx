import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';
import { capitalize } from "../utils/util";

function DateRangePicker() {
  const [loading, setLoading] = useState(false);
  const [selectedDateStart, setSelectedDateStart] = useState(new Date(2022, 9, 1));
  const [selectedDateEnd, setSelectedDateEnd] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState("range");

  const onOpen = () => {
    // productService.getProductsSmall().then(data => setProducts(data));
}

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
    if(newCalendarMode == 'range') setSelectedDateStart(new Date(2022, 9, 1))
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
    <Inplace closable closeIcon={'pi pi-check'}>
        <InplaceDisplay>
          <div className="flex gap-1 align-items-center text-white">
            { capitalize(selectedDateStart.toLocaleDateString('pt-BR',{ month: 'long', year: "numeric"})) }
              {calendarMode === "range"?<>   
                <i className="pi pi-arrows-h text-purple-300 text-xl mx-2"/>
                {selectedDateEnd.toLocaleDateString('pt-BR',{ month: 'long', year: "numeric"})}
            </>:
            <i className={calendarIcons[calendarMode].icon + " text-2xl text-purple-300 mx-2"}/>}
          </div>
        </InplaceDisplay>
        <InplaceContent className="flex p-3">
            {/* <InputText value={text} onChange={(e) => setText(e.target.value)} autoFocus /> */}
            <div className="flex gap-1 align-items-center">
            <Button
                icon={calendarIcons[calendarMode].icon + " text-2xl"}
                disabled={loading}
                className="p-button-help p-button-text p-button-rounded shadow-none"
                onClick={handleCalendarModeChange}
                aria-controls="popup_menu"
                aria-label={calendarIcons[calendarMode].ariaLabel}
              />
              <Calendar
                minDate={new Date(2022, 9, 1)}
                maxDate={selectedDateEnd}
                inputClassName="text-center"
                style={{ width: "9rem" }}
                disabled={loading}
                value={selectedDateStart}
                view="month"
                dateFormat="MM yy"
                onChange={handleStartDateChange}
              />
              
              {calendarMode === "range" && (
                <>
                <i className="pi pi-arrows-h text-white text-2xl"/>
                <Calendar
                  maxDate={new Date()}
                  minDate={selectedDateStart}
                  inputClassName="text-center"
                  style={{ width: "9rem" }}
                  disabled={loading}
                  value={selectedDateEnd}
                  view="month"
                  dateFormat="MM yy"
                  onChange={handleEndDateChange}
                />
                </>
              )}
            </div>
        </InplaceContent>
    </Inplace>
    
  );
}

export default DateRangePicker;
