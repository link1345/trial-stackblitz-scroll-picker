import { FC, useMemo, useCallback } from "react";
import { Stack, Typography } from "@mui/material";
import { ScrollPicker } from "./ScrollPicker";
import { range } from "lodash-es";
import { addYears, clamp as clampDate } from "date-fns";

const CURRENT_DATE = new Date();
const DEFAULT_MIN_DATE = addYears(CURRENT_DATE, -100);
const DEFAULT_MAX_DATE = addYears(CURRENT_DATE, 100);

export type DateScrollPickerProps = {
  /** 日付 */
  value: Date;
  /** 最小日付 */
  minDate?: Date;
  /** 最大日付 */
  maxDate?: Date;
  /**
   * 日付が変更された時
   * @param newValue - 新しい日付
   */
  onChangeValue: (newValue: Date) => void;
};

export const DateScrollPicker: FC<DateScrollPickerProps> = ({
  value,
  minDate = DEFAULT_MIN_DATE,
  maxDate = DEFAULT_MAX_DATE,
  onChangeValue,
}) => {
  const { year, month, day } = useMemo(() => {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }, [value]);
  const maxDayOfCurrentMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [month, year]);

  const yearItems = useMemo(() => {
    return range(minDate.getFullYear(), maxDate.getFullYear() + 1).map(
      (year) => ({
        value: year,
        label: `${year}`,
      })
    );
  }, [minDate, maxDate]);

  const monthItems = useMemo(() => {
    return range(1, 13).map((month) => {
      const yearMonthFirst = new Date(year, month - 1, 1, 0, 0, 0);
      const yearMonthLast = new Date(year, month, 0, 23, 59, 59);
      return {
        value: month,
        label: `${month}`,
        disabled: yearMonthLast < minDate || yearMonthFirst > maxDate,
      };
    });
  }, [maxDate, minDate, year]);

  const dayItems = useMemo(() => {
    return range(1, maxDayOfCurrentMonth + 1).map((day) => {
      const dateFirst = new Date(year, month - 1, day, 0, 0, 0);
      const dateLast = new Date(year, month - 1, day, 23, 59, 59);
      return {
        value: day,
        label: `${day}`,
        disabled: dateLast < minDate || dateFirst > maxDate,
      };
    });
  }, [maxDate, maxDayOfCurrentMonth, minDate, month, year]);

  const handleChangeValue = useCallback(
    (newDate: Date) => {
      onChangeValue(
        clampDate(newDate, {
          start: minDate,
          end: maxDate,
        })
      );
    },
    [maxDate, minDate, onChangeValue]
  );

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ScrollPicker
        value={year}
        items={yearItems}
        onChangeValue={(newYear) => {
          /** 次の年月の最大日数 */
          const maxDayOfNextMonthYear = new Date(newYear, month, 0).getDate();
          handleChangeValue(
            new Date(
              newYear,
              month - 1,
              // 最大日数を超えないように調整
              Math.min(day, maxDayOfNextMonthYear)
            )
          );
        }}
      />
      <Typography>年</Typography>
      <ScrollPicker
        value={month}
        items={monthItems}
        onChangeValue={(newMonth) => {
          /** 次の月の最大日数 */
          const maxDayOfNextMonth = new Date(year, newMonth, 0).getDate();
          handleChangeValue(
            new Date(
              year,
              newMonth - 1,
              // 最大日数を超えないように調整
              Math.min(day, maxDayOfNextMonth)
            )
          );
        }}
      />
      <Typography>月</Typography>
      <ScrollPicker
        value={day}
        items={dayItems}
        onChangeValue={(newDay) => {
          handleChangeValue(new Date(year, month - 1, newDay));
        }}
      />
      <Typography>日</Typography>
    </Stack>
  );
};
