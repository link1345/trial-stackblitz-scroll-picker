import { MutableRefObject, useEffect } from "react";

import { ScrollItem } from "./ScrollItemType";
import { scrollToItemValue } from "./scrollToItemValue";
import { SCROLL_ITEM_HEIGHT } from "./ScrollItemHeight";

/**
 * ul要素のscrollTopから選択可能な項目の値を取得する
 * @param elMenuList - ul要素
 * @param currentValue - 現在の値
 * @param items - 項目リスト
 */
const findSelectableScrollItemValue = function <V>(
  elMenuList: HTMLUListElement,
  currentValue: V,
  items: ScrollItem<V>[]
): V | undefined {
  const index = Math.round(elMenuList.scrollTop / SCROLL_ITEM_HEIGHT);
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
    return currentValue;
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
  return currentValue;
};

/**
 * スクロールを監視して項目の値を取得する
 */
export const useWatchScrollForItemValue = <V>({
  elMenuListRef,
  currentValue,
  items,
  onChangeValue,
}: {
  elMenuListRef: MutableRefObject<HTMLUListElement | null>;
  currentValue: V;
  items: ScrollItem<V>[];
  onChangeValue: (newValue: V) => void;
}) => {
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
        console.log("scroll end");
        // 同じ値を算出した場合は同じ場所に戻るようにスクロールして終了する
        if (itemValue === currentValue) {
          console.log("same value");
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
