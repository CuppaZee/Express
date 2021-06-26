import { IonBackButton, IonButtons, IonHeader, IonProgressBar, IonTitle, IonToolbar } from "@ionic/react";
import React, { PropsWithChildren } from "react";
import { useIsFetching } from "react-query";
import { Helmet } from "react-helmet";

export default function Header({
  title,
  extra,
  children,
}: {
  title?: string;
  extra?: PropsWithChildren<{}>["children"];
  children?: PropsWithChildren<{}>["children"];
}) {
  const isFetching = useIsFetching();
  return (
    <IonHeader>
      <Helmet>
        <title>☕️ {title}</title>
      </Helmet>
      <IonToolbar>
        {React.Children.count(children) === 0 && isFetching ? (
          <IonProgressBar type="indeterminate" />
        ) : null}
        <IonButtons slot="start">
          <IonBackButton />
        </IonButtons>
        <IonTitle>{title}</IonTitle>
      </IonToolbar>
      {React.Children.map(children, (i, n) => {
        return (
          <IonToolbar key={n}>
            {i}
            {React.Children.count(children) - 1 === n && isFetching ? (
              <IonProgressBar type="indeterminate" />
            ) : null}
          </IonToolbar>
        );
      })}
      {extra}
    </IonHeader>
  );
}
