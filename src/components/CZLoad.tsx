import { IonSkeletonText } from "@ionic/react";
import { PropsWithChildren } from "react";
import "./CZLoad.css";

export function CZLoadText({ children, loading }: PropsWithChildren<{loading: boolean}>) {
  if (loading) {
    return <IonSkeletonText animated className="cz-load-text" />
  }
  return <>{children}</>;
}