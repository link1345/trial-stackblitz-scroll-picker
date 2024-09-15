import { FC, useMemo } from "react";
import { Stack, Typography } from "@mui/material";
import { ScrollPicker } from "./ScrollPicker";
import { range } from "lodash-es";

export type DataScrollPickerProps = {
  value: Date;
  onChangeValue: (newValue: Date) => void;
};

export const DateScrollPicker: FC<DataScrollPickerProps> = ({
  value,
  onChangeValue,
}) => {
  const { year, month, day } = useMemo(() => {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }, [value]);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ScrollPicker
        value={year}
        items={range(1900, 2100).map((year) => ({
          value: year,
          label: `${year}`,
        }))}
        onChangeValue={(newYear) => {
          onChangeValue(new Date(newYear, month - 1, day));
        }}
      />
      <Typography>年</Typography>
      <ScrollPicker
        value={month}
        items={range(1, 13).map((month) => ({
          value: month,
          label: `${month}`,
        }))}
        onChangeValue={(newMonth) => {
          onChangeValue(new Date(year, newMonth - 1, day));
        }}
      />
      <Typography>月</Typography>
      <ScrollPicker
        value={day}
        items={range(1, 32).map((day) => ({
          value: day,
          label: `${day}`,
        }))}
        onChangeValue={(newDay) => {
          onChangeValue(new Date(year, month - 1, newDay));
        }}
      />
      <Typography>日</Typography>
    </Stack>
  );
};
