import { useMemo } from "react";

/**
 * 慣性スクロールをする
 * @param element - スクロールさせる要素
 * @param startVectorY - スクロールの初速
 * @param decay - 減少量
 */
const inertiaScroll = (
  element: HTMLUListElement,
  startVectorY: number,
  decay: number,
  onFinish: () => void
) => {
  console.log(startVectorY);
  let vecY = startVectorY;
  const handleFrame = () => {
    vecY *= decay;
    element.scrollTop += vecY;
    if (Math.abs(vecY) < 1) {
      onFinish();
      return;
    }
    requestAnimationFrame(handleFrame);
  };
  handleFrame();
};

/**
 * スクロールをJS側で制御するカスタムフック
 */
export const useHandleScroll = () => {
  const ref = useMemo(() => {
    let cachedElement: HTMLUListElement | null = null;
    const handleWheel = (event: WheelEvent) => {
      event.stopPropagation();
      if (cachedElement == null) {
        return;
      }
      cachedElement.scrollTop += event.deltaY;
    };

    /** タッチ開始座標 */
    let startPosY: number | null = null;
    /** タッチ開始時のスクロール位置 */
    let startScrollTop: number | null = null;
    /** 一つ前のタッチ座標 */
    let prevTouchPosY: number | null = null;
    /** タッチ開始時間 */
    let startTouchTime: number | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      startPosY = event.touches[0]?.clientY ?? null;
      prevTouchPosY = startPosY;
      startScrollTop = cachedElement?.scrollTop ?? null;
      startTouchTime = performance.now();
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (startPosY == null) {
        return;
      }
      prevTouchPosY = event.touches[0].clientY;
      const diff = startPosY - prevTouchPosY;
      if (startScrollTop != null && cachedElement != null) {
        cachedElement.scrollTop = startScrollTop + diff;
      }
    };
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      if (
        cachedElement != null &&
        startScrollTop != null &&
        startTouchTime != null
      ) {
        const distance = cachedElement.scrollTop - startScrollTop;
        const elapsedTime = performance.now() - startTouchTime!;
        console.log(distance, elapsedTime);
        if (elapsedTime > 100) {
          inertiaScroll(
            cachedElement,
            (50 * distance) / elapsedTime,
            0.9,
            () => {
              console.log("finish");
            }
          );
        }
      }
      startPosY = null;
      prevTouchPosY = null;
      startScrollTop = null;
      startTouchTime = null;
    };
    return (element: HTMLUListElement | null) => {
      if (element == null) {
        if (cachedElement != null) {
          cachedElement.removeEventListener("wheel", handleWheel);
          cachedElement.removeEventListener("touchstart", handleTouchStart);
          cachedElement.removeEventListener("touchmove", handleTouchMove);
          cachedElement.removeEventListener("touchend", handleTouchEnd);
        }
        cachedElement = null;
        return;
      }

      cachedElement = element;
      cachedElement.addEventListener("wheel", handleWheel);
      cachedElement.addEventListener("touchstart", handleTouchStart);
      cachedElement.addEventListener("touchmove", handleTouchMove);
      cachedElement.addEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return {
    ref,
  };
};
