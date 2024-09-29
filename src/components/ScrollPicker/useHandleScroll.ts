import { useMemo } from "react";

/**
 * スクロールをJS側で制御するカスタムフック
 */
export const useHandleScroll = ({
  onFinishScroll,
}: {
  /** スクロールが終了した時 */
  onFinishScroll: () => void;
}) => {
  const ref = useMemo(() => {
    let cachedElement: HTMLUListElement | null = null;
    let timerId: number | undefined;
    const handleWheel = (event: WheelEvent) => {
      event.stopPropagation();
      if (cachedElement == null) {
        return;
      }
      cachedElement.scrollTop += event.deltaY;

      clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        onFinishScroll();
      }, 100);
    };

    /** タッチ開始座標 */
    let startPosY: number | null = null;
    /** タッチ開始時のスクロール位置 */
    let startScrollTop: number | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      startPosY = event.touches[0]?.clientY ?? null;
      startScrollTop = cachedElement?.scrollTop ?? null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (startPosY == null) {
        return;
      }
      const diff = startPosY - event.touches[0].clientY;
      if (startScrollTop != null && cachedElement != null) {
        cachedElement.scrollTop = startScrollTop + diff;
      }
    };
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      startPosY = null;
      startScrollTop = null;
      onFinishScroll();
    };
    return (element: HTMLUListElement | null) => {
      if (element == null) {
        if (cachedElement != null) {
          cachedElement.removeEventListener("wheel", handleWheel);
          cachedElement.removeEventListener("touchstart", handleTouchStart);
          cachedElement.removeEventListener("touchmove", handleTouchMove);
          cachedElement.removeEventListener("touchend", handleTouchEnd);
        }
        clearTimeout(timerId);
        cachedElement = null;
        return;
      }

      cachedElement = element;
      cachedElement.addEventListener("wheel", handleWheel);
      cachedElement.addEventListener("touchstart", handleTouchStart);
      cachedElement.addEventListener("touchmove", handleTouchMove);
      cachedElement.addEventListener("touchend", handleTouchEnd);
    };
  }, [onFinishScroll]);

  return {
    ref,
  };
};
