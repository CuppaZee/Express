import { useRef } from "react";
import useElementSize from "./useElementSize";

const generateStyle = (i = 1) => ({
  width: ((100 / i) - 0.1) + "%",
  maxWidth: "100%",
  flexBasis: ((100 / i) - 0.1) + "%",
  flexGrow: 1,
  flexShrink: 0,
});

export default function useFancyGrid<T extends HTMLElement = HTMLDivElement>(
  elements: number,
  width: number,
  regularGrid: boolean = false,
) {
  const elementRef = useRef<T>(null);
  const elementSize = useElementSize(elementRef);
  if (!elementSize.width) {
    return [elementRef, new Array(elements).fill(generateStyle(1))] as const;
  }
  const elementsPerRow = Math.max(1, Math.floor(elementSize.width / width));
  if (regularGrid) {
    return [elementRef, new Array(elements).fill(generateStyle(elementsPerRow))] as const;
  }
  const rows = Math.ceil(elements / elementsPerRow);
  const rowsArray: number[] = new Array(rows).fill(0);
  let row = 0;
  for (let i = 0; i < elements; i++) {
    rowsArray[row]++;
    row = row === rows - 1 ? 0 : row + 1;
  }
  const elementsArray = [];
  for (const row of rowsArray) {
    const style = generateStyle(row);
    for (let i = 0; i < row; i++) {
      elementsArray.push(style);
    }
  }
  return [elementRef, elementsArray] as const;
}
