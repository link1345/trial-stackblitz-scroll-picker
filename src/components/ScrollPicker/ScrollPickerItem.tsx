import React from "react";
import { ListItemText, MenuItem } from "@mui/material";
import type { FC, ReactNode } from "react";

import { SCROLL_ITEM_HEIGHT } from "./constants/ScrollItemHeight";
import { useJustClick } from "./hooks/useJustClick";

export type ScrollPickerItemProps = {
  /** 選択されているか */
  selected?: boolean;
  /** 非活性か */
  disabled?: boolean;
  /** 子要素 */
  children: ReactNode;
  /**
   * ドラッグ操作は無効にして純粋なクリック操作のみを検知した時
   */
  onJustClick: () => void;
};

export const ScrollPickerItem: FC<ScrollPickerItemProps> = ({
  selected,
  disabled,
  children,
  onJustClick,
}) => {
  const { ref } = useJustClick({
    disabled,
    onJustClick: () => {
      // ScrollPickerのスクロールの判定後にclickイベントを発火させたいのでワンサイクル遅らせる
      setTimeout(() => {
        onJustClick();
      });
    },
  });

  return (
    <MenuItem
      ref={ref}
      style={{
        height: SCROLL_ITEM_HEIGHT,
        minHeight: "auto",
        textAlign: "center",
      }}
      selected={selected}
      disabled={disabled}
    >
      <ListItemText
        sx={{
          "& > .MuiListItemText-primary": {
            fontWeight: selected ? "bold" : undefined,
          },
        }}
        primary={children}
      />
    </MenuItem>
  );
};
