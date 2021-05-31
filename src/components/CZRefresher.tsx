import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { UseQueryResult } from "react-query";

export interface CZRefresherProps {
  queries: UseQueryResult[];
}

export default function CZRefresher({ queries }: CZRefresherProps) {
  return (
    <IonRefresher
      slot="fixed"
      onIonRefresh={ev => {
        Promise.all(queries.map(i => i.refetch())).then(() => ev.detail.complete());
      }}>
      <IonRefresherContent />
    </IonRefresher>
  );
}
