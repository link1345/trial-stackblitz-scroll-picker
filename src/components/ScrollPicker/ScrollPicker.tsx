import { useRef, useEffect } from "react";
import { Box, MenuList, MenuItem, useForkRef } from "@mui/material";

import { SCROLL_ITEM_HEIGHT } from "./constants/ScrollItemHeight";
import { scrollToItemValue } from "./utils/scrollToItemValue";
import { findSelectableScrollItemValue } from "./utils/findSelectableScrollItemValue";
import { ScrollItem } from "./types/ScrollItemType";
import { ScrollPickerItem } from "./ScrollPickerItem";
import { useHandleScroll } from "./hooks/useHandleScroll";

export type ScrollPickerProps<V> = {
  /** 選択中の値 */
  value: V;
  /** 選択リスト */
  items: ScrollItem<V>[];
  /** スクローラーの高さ */
  height?: number;
  /**
   * 値が変更された時
   * @param newValue - 新しい値
   */
  onChangeValue: (newValue: V) => void;
};

export const ScrollPicker = function <V>({
  value,
  items,
  height = 5 * SCROLL_ITEM_HEIGHT,
  onChangeValue,
}: ScrollPickerProps<V>) {
  /** 初回のスクロールか（初回はアニメーションではなく直接scrollTopを変更する） */
  const isFirstScrollRef = useRef<boolean>(true);
  const elMenuListRef = useRef<HTMLUListElement | null>(null);
  /** スクロールの始端・終端がピッタリ真ん中で収まるように調整する余白の高さ */
  const paddingHeight = (height - SCROLL_ITEM_HEIGHT) / 2;

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

  const { ref: refScroller } = useHandleScroll({
    onFinishScroll: () => {
      const elMenuList = elMenuListRef.current;
      if (elMenuList == null) {
        return;
      }
      const itemValue = findSelectableScrollItemValue(elMenuList, value, items);
      if (itemValue === undefined) {
        return;
      }
      // 同じ値を算出した場合は同じ場所に戻るようにスクロールして終了する
      if (itemValue === value) {
        scrollToItemValue(elMenuList, items, itemValue);
        return;
      }
      onChangeValue(itemValue);
    },
  });
  const handleRef = useForkRef(elMenuListRef, refScroller);

  return (
    <Box
      sx={{
        position: "relative",
        height,
      }}
    >
      <MenuList
        ref={handleRef}
        sx={{
          height: "100%",
          overflowY: "scroll",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
        disablePadding
      >
        <MenuItem
          key={`pad-top`}
          sx={{
            height: paddingHeight,
            minHeight: "auto",
          }}
          disabled
        />
        {items.map((item) => (
          <ScrollPickerItem
            key={String(item.value)}
            selected={item.value === value}
            disabled={item.disabled}
            onJustClick={() => {
              onChangeValue(item.value);
            }}
          >
            {item.label}
          </ScrollPickerItem>
        ))}
        <MenuItem
          key={`pad-bottom`}
          sx={{
            height: paddingHeight,
            minHeight: "auto",
          }}
          disabled
        />
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
