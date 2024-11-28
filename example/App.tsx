import React, { useState, FC } from "react";
import { formatDate } from "date-fns";

import { ScrollPicker, DateScrollPicker, InputDateByScrollPicker } from "../src/index";

const App: FC = () => {
  const [value, setValue] = useState<number | null>(3);
  const [pickerDate, setPickerDate] = useState<Date>(() => new Date());
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  return (<div>
    <ScrollPicker
      value={value}
      items={[...new Array(20)].map((_, index) => {
        return {
          value: index,
          label: `項目${index}`,
        };
      })}
      onChangeValue={(newValue) => {
        setValue(newValue);
      }}
    />
    <ScrollPicker
      value={value}
      items={[...new Array(20)].map((_, index) => {
        const disabled = index % 2 === 0 || index % 3 === 0;
        return {
          value: index,
          label: `項目${index}` + (disabled ? "（無効）" : ""),
          disabled,
        };
      })}
      onChangeValue={(newValue) => {
        setValue(newValue);
      }}
    />

    <DateScrollPicker
      value={pickerDate}
      onChangeValue={(newDate) => {
        setPickerDate(newDate);
      }}
    />

    <InputDateByScrollPicker
      pickerUi="dialog"
      value={currentDate}
      onChangeValue={(newDate) => {
        setCurrentDate(newDate);
      }}
    />

    <InputDateByScrollPicker
      pickerUi="popover"
      value={currentDate}
      onChangeValue={(newDate) => {
        setCurrentDate(newDate);
      }}
    />
  </div>
  );
};

export default App;
