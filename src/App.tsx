import { useState, FC } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { formatDate } from "date-fns";

import { ScrollPicker } from "./components/ScrollPicker";
import { DateScrollPicker } from "./components/DateScrollPicker";
import { InputDateByScrollPicker } from "./components/InputDateByScrollPicker";

const App: FC = () => {
  const [value, setValue] = useState<number | null>(3);
  const [pickerDate, setPickerDate] = useState<Date>(() => new Date());
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  return (
    <Container sx={{ p: 1 }}>
      <div>value: {value}</div>
      <Stack direction="row" spacing={2}>
        <Box sx={{ flex: "1 1 0" }}>
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
        </Box>
        <Box sx={{ flex: "1 1 0" }}>
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
        </Box>
      </Stack>
      <hr />
      <Typography sx={{ textAlign: "center" }}>
        {formatDate(pickerDate, "yyyy年MM月dd日")}
      </Typography>
      <Stack direction="row" justifyContent="center">
        <DateScrollPicker
          value={pickerDate}
          onChangeValue={(newDate) => {
            setPickerDate(newDate);
          }}
        />
      </Stack>
      <hr />
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <Box sx={{ width: 250, margin: "0 auto" }}>
          <Typography>ダイアログパターン</Typography>
          <InputDateByScrollPicker
            pickerUi="dialog"
            value={currentDate}
            onChangeValue={(newDate) => {
              setCurrentDate(newDate);
            }}
          />
        </Box>
        <Box sx={{ width: 250, margin: "0 auto" }}>
          <Typography>ポップアップパターン</Typography>
          <InputDateByScrollPicker
            pickerUi="popover"
            value={currentDate}
            onChangeValue={(newDate) => {
              setCurrentDate(newDate);
            }}
          />
        </Box>
      </Stack>
      <Box
        // 余白用
        sx={{ height: 400 }}
      />
    </Container>
  );
};

export default App;
