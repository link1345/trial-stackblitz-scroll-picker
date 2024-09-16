import { useRef, useEffect } from "react";
import { Box, MenuList, MenuItem, ListItemText } from "@mui/material";
import { times } from "lodash-es";

/** 1つの項目の高さ */
const ITEM_HEIGHT = 40;
/** 見える項目の数 */
const NUM_SHOW_ITEM = 5;

/**
 * ul要素のscrollTopから中央の項目の値を取得する
 * @param elMenuList - ul要素
 * @param items - 項目リスト
 */
const pickCenterIndexValue = function <V>(
  elMenuList: HTMLUListElement,
  items: Array<{ value: V; label: string }>
) {
  const index = Math.round(elMenuList.scrollTop / ITEM_HEIGHT);
  const item = items[index];
  if (item == null) {
    return undefined;
  }
  return item.value;
};

export type ScrollPickerProps<V> = {
  value: V | null;
  items: Array<{ value: V; label: string }>;
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

  useEffect(() => {
    const elMenuList = elMenuListRef.current;
    if (elMenuList == null) {
      return;
    }

    let timerId: number | undefined;
    const debouncedHandleScroll = (event: Event) => {
      clearTimeout(timerId);

      const elMenuList = event.target;
      if (elMenuList == null || !(elMenuList instanceof HTMLUListElement)) {
        return;
      }

      timerId = window.setTimeout(() => {
        const itemValue = pickCenterIndexValue(elMenuList, items);
        if (itemValue === undefined) {
          return;
        }
        onChangeValue(itemValue);
      }, 100);
    };

    elMenuList.addEventListener("scroll", debouncedHandleScroll);

    return () => {
      elMenuList.removeEventListener("scroll", debouncedHandleScroll);
      clearTimeout(timerId);
    };
  }, [items, onChangeValue]);

  useEffect(() => {
    const elMenuList = elMenuListRef.current;
    if (elMenuList == null) {
      return;
    }

    const isFirstScroll = isFirstScrollRef.current;
    isFirstScrollRef.current = false;

    const targetIndex = items.findIndex((item) => item.value === value);
    if (targetIndex < 0) {
      return;
    }

    const scrollTop = targetIndex * ITEM_HEIGHT;
    if (isFirstScroll) {
      elMenuList.scrollTop = scrollTop;
      return;
    }
    elMenuList.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  }, [items, value]);

  return (
    <Box
      sx={{
        position: "relative",
        height: NUM_SHOW_ITEM * ITEM_HEIGHT,
      }}
    >
      <MenuList
        ref={elMenuListRef}
        sx={{
          height: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
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
              height: ITEM_HEIGHT,
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
              height: ITEM_HEIGHT,
              minHeight: "auto",
              textAlign: "center",
            }}
            selected={item.value === value}
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
              height: ITEM_HEIGHT,
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
