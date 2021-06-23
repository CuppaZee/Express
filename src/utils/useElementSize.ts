// Source: https://usehooks-typescript.com/react-hook/use-element-size

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import useEventListener from "./useEventListener";

interface Size {
  width: number;
  height: number;
}

function useElementSize<T extends HTMLElement = HTMLDivElement>(elementRef: RefObject<T>): Size {
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  // Prevent too many rendering using useCallback
  const updateSize = useCallback(() => {
    const node = elementRef?.current;
    if (node && node.offsetWidth > 5 && (node.offsetWidth !== size.width && node.offsetHeight !== size.height)) {
      setSize({
        width: node.offsetWidth || 0,
        height: node.offsetHeight || 0,
      });
      return {
        width: node.offsetWidth || 0,
        height: node.offsetHeight || 0,
      };
    }
  }, [elementRef]);

  useEffect(() => {
    if (size.width === 0) {
      const interval = setInterval(() => {
        const d = updateSize()
        if ((d?.width ?? 0) > 5) {
          clearInterval(interval)
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [])

  // Initial size on mount
  useEffect(() => {
    updateSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef.current, elementRef.current?.offsetWidth, elementRef.current?.offsetHeight]);

  useEventListener<T>("resize", updateSize, elementRef);
  useEventListener("resize", updateSize);

  return size;
}

export default useElementSize;
