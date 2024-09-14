import { useState, FC } from "react";
import { Box } from "@mui/material";

import { ScrollPicker } from "./components/ScrollPicker";

const App: FC = () => {
  const [value, setValue] = useState<number | null>(3);

  return (
    <Box sx={{ p: 1 }}>
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
    </Box>
  );
};

export default App;
