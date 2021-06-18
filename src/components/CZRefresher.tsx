import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { MutableRefObject } from "react";
import { UseQueryResult } from "react-query";

export interface CZRefresherProps {
  queries: UseQueryResult[] | MutableRefObject<Set<UseQueryResult>>;
}

export default function CZRefresher({ queries }: CZRefresherProps) {
  return (
    <IonRefresher
      slot="fixed"
      onIonRefresh={ev => {
        if ("current" in queries) {
          Promise.all(Array.from(queries.current.values()).map(i => i.refetch())).then(() => ev.detail.complete());
        } else {
          Promise.all(queries.map(i => i.refetch())).then(() => ev.detail.complete());
        }
      }}>
      <IonRefresherContent />
    </IonRefresher>
  );
}
