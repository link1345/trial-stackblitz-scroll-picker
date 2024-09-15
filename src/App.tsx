import { useState, FC } from "react";
import { Container, Stack, Typography } from "@mui/material";
import { formatDate } from "date-fns";

import { ScrollPicker } from "./components/ScrollPicker";
import { DateScrollPicker } from "./components/DateScrollPicker";

const App: FC = () => {
  const [value, setValue] = useState<number | null>(3);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  return (
    <Container sx={{ p: 1 }}>
      <div>value: {value}</div>
      <ScrollPicker
        value={value}
        items={[...new Array(10)].map((_, index) => ({
          value: index,
          label: `項目${index}`,
        }))}
        onChangeValue={(newValue) => {
          setValue(newValue);
        }}
      />
      <hr />
      <Typography sx={{ textAlign: "center" }}>
        {formatDate(currentDate, "yyyy年MM月dd日")}
      </Typography>
      <Stack direction="row" justifyContent="center">
        <DateScrollPicker value={currentDate} onChangeValue={setCurrentDate} />
      </Stack>
    </Container>
  );
};

export default App;
