import { MutableRefObject, UIEvent, useEffect, useRef, WheelEvent } from "react";

export class ScrollSyncController {
  scrollViews: Set<HTMLElement> = new Set();
  latestScroll?: {
    expiry: number;
    element: HTMLElement;
  };
}

export function useScrollSyncController() {
  return useRef(new ScrollSyncController());
}

export function useScrollSync<T extends HTMLElement>(controller?: MutableRefObject<ScrollSyncController>) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current) {
      const scrollView = ref.current;
      controller?.current?.scrollViews.add(scrollView);
      return () => {
        controller?.current?.scrollViews.delete(scrollView);
      };
    }
  }, [ref.current]);
  return [
    ref,
    () => {
      const el = ref.current;
      if (
        el &&
        controller &&
        (!controller.current.latestScroll ||
          controller.current.latestScroll.element === el ||
          controller.current.latestScroll.expiry < Date.now())
      ) {
        controller.current.latestScroll = {
          expiry: Date.now() + 200,
          element: el,
        }
        const innerWidth = el.scrollWidth;
        const outerWidth = el.clientWidth;
        const scrollPosition = el.scrollLeft;
        const scrollPositionRight = innerWidth - outerWidth - scrollPosition;
        const elementPositions = [];
        let sum = -el.children[0].clientWidth;
        for (const element of Array.from(el.children)) {
          const width = element.clientWidth;
          elementPositions.push(sum);
          sum += width;
        }
        const index = Math.max(1, elementPositions.findIndex(i => i > scrollPosition) - 1);
        const offsetPercent =
          (scrollPosition - elementPositions[index]) / el.children[index].clientWidth;
        controller?.current?.scrollViews.forEach(i => {
          if (i !== el) {
            if (scrollPositionRight < 2) {
              i.scrollTo(10000, 0);
            } else {
              const c = i.children[index] as any;
              const cl = i.children[0] as any;
              if (c && cl) {
                i.scrollTo(c.offsetLeft - cl.clientWidth + offsetPercent * c.clientWidth, 0);
              }
            }
          }
        });
      }
    },
  ] as const;
}
