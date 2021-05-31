import { useIonRouter } from "@ionic/react";
import { useRef } from "react";

export default function useCZParams<D extends { [key: string]: string }>(...routes: string[]): Partial<D> | undefined {
  const ref = useRef<Partial<D> | undefined>();
  const { routeInfo: {pathname} } = useIonRouter();
  const x = routes.map(i =>
    pathname.match(new RegExp(i.replace(/:([^/]+)/g, "(?<$1>[^/]+)")))?.groups
  ).filter(Boolean);
  ref.current = (x[0] as Partial<D> | undefined) ?? ref.current;
  return ref.current;
}