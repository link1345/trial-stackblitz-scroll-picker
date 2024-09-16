import { useRef, useEffect, MutableRefObject } from "react";
import { Box, MenuList, MenuItem, ListItemText } from "@mui/material";
import { times } from "lodash-es";

/** 1つの項目の高さ */
const ITEM_HEIGHT = 40;
/** 見える項目の数 */
const NUM_SHOW_ITEM = 5;

/** スクロールして選択する項目 */
type ScrollItem<V> = {
  value: V;
  label: string;
  disabled?: boolean;
};

/**
 * 対処の値にスクロールする
 * @param elMenuList - ul要素
 * @param items - 項目リスト
 * @param targetValue - スクロール先の値
 * @param options - オプション
 */
const scrollToItemValue = function <V>(
  elMenuList: HTMLUListElement,
  items: ScrollItem<V>[],
  targetValue: V,
  {
    disableAnimation,
  }: {
    /** アニメーションせず即時移動させるか */
    disableAnimation?: boolean;
  } = {}
) {
  const targetIndex = items.findIndex((item) => item.value === targetValue);
  if (targetIndex < 0) {
    return;
  }

  const scrollTop = targetIndex * ITEM_HEIGHT;
  if (disableAnimation) {
    elMenuList.scrollTop = scrollTop;
    return;
  }
  elMenuList.scrollTo({
    top: scrollTop,
    behavior: "smooth",
  });
};

/**
 * ul要素のscrollTopから選択可能な項目の値を取得する
 * @param elMenuList - ul要素
 * @param items - 項目リスト
 */
const findSelectableScrollItemValue = function <V>(
  elMenuList: HTMLUListElement,
  currentValue: V | null,
  items: ScrollItem<V>[]
): V | undefined {
  const index = Math.round(elMenuList.scrollTop / ITEM_HEIGHT);
  const item = items[index];
  if (item == null) {
    return undefined;
  }
  if (!item.disabled) {
    return item.value;
  }

  // スクロール位置にある項目がdisabledの場合、最も近い有効な項目を探す
  const currentIndex = items.findIndex((item) => item.value === currentValue);
  // 選択中の項目が見つからなかった場合は何もしない
  if (currentIndex === -1) {
    return undefined;
  }
  // 同じ場所を指した場合は現在の値を返す
  if (currentIndex === index) {
    // MEMO: currentValueはnullを受け入れない方が良さそう
    return currentValue ?? undefined;
  }

  const possiblyTopItems = items.slice(0, index).reverse();
  const possiblyTopItemIndex = possiblyTopItems.findIndex(
    (item) => !item.disabled
  );
  const possiblyBottomItems = items.slice(index + 1);
  const possiblyBottomItemIndex = possiblyBottomItems.findIndex(
    (item) => !item.disabled
  );

  // どちらも見つからなかった場合は何もしない
  if (possiblyTopItemIndex === -1 && possiblyBottomItemIndex === -1) {
    return undefined;
  }
  // どちらかが見つからなかった場合は見つかった方を返す
  if (possiblyTopItemIndex === -1) {
    return possiblyBottomItems[possiblyBottomItemIndex]?.value;
  }
  if (possiblyBottomItemIndex === -1) {
    return possiblyTopItems[possiblyTopItemIndex]?.value;
  }
  // どちらも見つかった場合は近い方を返す
  if (possiblyTopItemIndex < possiblyBottomItemIndex) {
    return possiblyTopItems[possiblyTopItemIndex]?.value;
  }
  if (possiblyTopItemIndex > possiblyBottomItemIndex) {
    return possiblyBottomItems[possiblyBottomItemIndex]?.value;
  }
  // どちらも同じ距離の場合は、選択中の項目から近い方を返す
  if (currentIndex < index) {
    return possiblyTopItems[possiblyTopItemIndex]?.value;
  }
  if (currentIndex > index) {
    return possiblyBottomItems[possiblyBottomItemIndex]?.value;
  }
  // それ以外のケースはあり得ないが、念のため現在の値を返す
  return currentValue ?? undefined;
};

/**
 * スクロールを監視して項目の値を取得する
 */
const useScrollItemValue = function <V>({
  elMenuListRef,
  currentValue,
  items,
  onChangeValue,
}: {
  elMenuListRef: MutableRefObject<HTMLUListElement | null>;
  currentValue: V | null;
  items: ScrollItem<V>[];
  onChangeValue: (newValue: V) => void;
}) {
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
        const itemValue = findSelectableScrollItemValue(
          elMenuList,
          currentValue,
          items
        );
        if (itemValue === undefined) {
          return;
        }
        // 同じ値を算出した場合は同じ場所に戻るようにスクロールして終了する
        if (itemValue === currentValue) {
          scrollToItemValue(elMenuList, items, itemValue);
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
  }, [currentValue, elMenuListRef, items, onChangeValue]);
};

export type ScrollPickerProps<V> = {
  /** 選択中の値 */
  value: V | null;
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

  useScrollItemValue({
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
        height: NUM_SHOW_ITEM * ITEM_HEIGHT,
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
