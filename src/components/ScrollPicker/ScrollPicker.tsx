import { useRef, useEffect } from "react";
import { Box, MenuList, MenuItem, ListItemText } from "@mui/material";
import { times } from "lodash-es";

import { SCROLL_ITEM_HEIGHT } from "./ScrollItemHeight";
import { scrollToItemValue } from "./scrollToItemValue";
import { useWatchScrollForItemValue } from "./useWatchScrollForItemValue";
import { ScrollItem } from "./ScrollItemType";

/** 見える項目の数 */
const NUM_SHOW_ITEM = 5;

export type ScrollPickerProps<V> = {
  /** 選択中の値 */
  value: V;
  /** 選択リスト */
  items: ScrollItem<V>[];
  /**
   * 値が変更された時
   * @param newValue - 新しい値
   */
  onChangeValue: (newValue: V) => void;
};

export const ScrollPicker = function <V>({
  value,
  items,
  onChangeValue,
}: ScrollPickerProps<V>) {
  /** 初回のスクロールか（初回はアニメーションではなく直接scrollTopを変更する） */
  const isFirstScrollRef = useRef<boolean>(true);
  const elMenuListRef = useRef<HTMLUListElement | null>(null);
  const numPadItem = Math.floor(NUM_SHOW_ITEM / 2);

  useWatchScrollForItemValue({
    elMenuListRef,
    currentValue: value,
    items,
    onChangeValue,
  });

  useEffect(() => {
    const elMenuList = elMenuListRef.current;
    if (elMenuList == null) {
      return;
    }

    const isFirstScroll = isFirstScrollRef.current;
    isFirstScrollRef.current = false;

    scrollToItemValue(elMenuList, items, value, {
      disableAnimation: isFirstScroll,
    });
  }, [items, value]);

  return (
    <Box
      sx={{
        position: "relative",
        height: NUM_SHOW_ITEM * SCROLL_ITEM_HEIGHT,
      }}
    >
      <MenuList
        ref={elMenuListRef}
        sx={{
          height: "100%",
          overflowY: "scroll",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
        disablePadding
      >
        {times(numPadItem).map((index) => (
          <MenuItem
            key={`top-${index}`}
            sx={{
              height: SCROLL_ITEM_HEIGHT,
              minHeight: "auto",
            }}
            disabled
          ></MenuItem>
        ))}
        {items.map((item) => (
          <MenuItem
            key={String(item.value)}
            sx={{
              scrollSnapAlign: "center",
              height: SCROLL_ITEM_HEIGHT,
              minHeight: "auto",
              textAlign: "center",
            }}
            selected={item.value === value}
            disabled={item.disabled}
            onClick={() => {
              onChangeValue(item.value);
            }}
          >
            <ListItemText
              sx={{
                "& > .MuiListItemText-primary": {
                  fontWeight: item.value === value ? "bold" : undefined,
                },
              }}
              primary={item.label}
            />
          </MenuItem>
        ))}
        {times(numPadItem).map((index) => (
          <MenuItem
            key={`bottom-${index}`}
            sx={{
              height: SCROLL_ITEM_HEIGHT,
              minHeight: "auto",
            }}
            disabled
          ></MenuItem>
        ))}
      </MenuList>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "40%",
          background:
            "linear-gradient(rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "40%",
          background:
            "linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};
