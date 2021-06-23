import { Children, PropsWithChildren } from "react";
import useFancyGrid from "../utils/useFancyGrid";

export interface FancyGridProps {
  width: number;
  maxWidth?: number;
}

export default function FancyGrid(props: PropsWithChildren<FancyGridProps>) {
  const [ref, elements] = useFancyGrid(Children.count(props.children), props.width);
  return (
    <div
      className="fancy-grid-wrapper"
      style={{
        maxWidth: props.maxWidth,
        marginLeft: props.maxWidth ? "auto" : 0,
        marginRight: props.maxWidth ? "auto" : 0,
      }}
      ref={ref}>
      {Children.map(props.children, (i, n) => (
        <div className="fancy-grid-element" style={elements[n]}>
          {i}
        </div>
      ))}
    </div>
  );
}