import { IonHeader, IonProgressBar, IonTitle, IonToolbar } from "@ionic/react";
import { PropsWithChildren } from "react";
import { useIsFetching } from "react-query";

export default function Header({ title, children }: { title?: string; children?: PropsWithChildren<{}>["children"] }) {
  const isFetching = useIsFetching();
  return (
    <IonHeader>
      {isFetching ? (
        <div style={{ height: 0 }}>
          <IonProgressBar type="indeterminate" />{" "}
        </div>
      ) : (
        <></>
      )}
      {!!title && <IonToolbar>
        <IonTitle>{title}</IonTitle>
      </IonToolbar>}
      {children}
    </IonHeader>
  );
}
