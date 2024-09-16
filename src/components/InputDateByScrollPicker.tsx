import { FC, useState } from "react";
import { formatDate } from "date-fns";
import {
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import CloseIcon from "@mui/icons-material/Close";

import { DateScrollPicker, DateScrollPickerProps } from "./DateScrollPicker";

const InputDateContent: FC<
  {
    initialDate: Date;
    onCancel: () => void;
    onSubmit: (newDate: Date) => void;
  } & Pick<DateScrollPickerProps, "minDate" | "maxDate">
> = ({ initialDate, onCancel, onSubmit, ...restProps }) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  return (
    <>
      <DialogContent dividers>
        <DateScrollPicker
          value={currentDate}
          onChangeValue={setCurrentDate}
          {...restProps}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>キャンセル</Button>
        <Button
          variant="contained"
          onClick={() => {
            onSubmit(currentDate);
          }}
        >
          決定
        </Button>
      </DialogActions>
    </>
  );
};

const DEFAULT_INITIAL_PICKER_DATE = new Date();

export type InputDateByScrollPickerProps = {
  /** 日付 */
  value: Date | null;
  /** valueがnullの時にPickerに初期表示する日付 */
  initialPickerDate?: Date;
  /**
   * 日付が変更された時
   * @param newValue - 新しい日付
   */
  onChangeValue: (newValue: Date | null) => void;
} & Pick<DateScrollPickerProps, "minDate" | "maxDate">;

export const InputDateByScrollPicker: FC<InputDateByScrollPickerProps> = ({
  value,
  initialPickerDate = DEFAULT_INITIAL_PICKER_DATE,
  onChangeValue,
  ...restProps
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TextField
        value={value ? formatDate(value, "yyyy/MM/dd") : ""}
        variant="outlined"
        size="small"
        placeholder="選択してください"
        fullWidth
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                {value != null && (
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onChangeValue(null);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
                <EventIcon />
              </InputAdornment>
            ),
            sx: {
              cursor: "pointer",
              "& > .MuiInputBase-input": {
                cursor: "pointer",
              },
            },
          },
        }}
        onClick={() => {
          setIsOpen(true);
        }}
      />
      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <InputDateContent
          {...restProps}
          initialDate={value ?? initialPickerDate}
          onCancel={() => {
            setIsOpen(false);
          }}
          onSubmit={(newDate) => {
            onChangeValue(newDate);
            setIsOpen(false);
          }}
        />
      </Dialog>
    </>
  );
};
