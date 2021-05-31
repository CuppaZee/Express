import { IonBackButton, IonButtons, IonHeader, IonProgressBar, IonTitle, IonToolbar } from "@ionic/react";
import React, { PropsWithChildren } from "react";
import { useIsFetching } from "react-query";

export default function Header({
  title,
  children,
}: {
  title?: string;
  children?: PropsWithChildren<{}>["children"];
}) {
  const isFetching = useIsFetching();
  return (
    <IonHeader>
      <IonToolbar>
        {React.Children.count(children) === 0 && isFetching ? (
          <IonProgressBar type="indeterminate" />
        ) : null}
        <IonButtons slot="start">
          <IonBackButton />
        </IonButtons>
        <IonTitle>{title}</IonTitle>
      </IonToolbar>
      {React.Children.map(children, (i, n) => (
        <IonToolbar>
          {i}
          {React.Children.count(children) - 1 === n && isFetching ? (
            <IonProgressBar type="indeterminate" />
          ) : null}
        </IonToolbar>
      ))}
    </IonHeader>
  );
}