import { IonBackButton, IonButton, IonButtons, IonHeader, IonProgressBar, IonTitle, IonToolbar } from "@ionic/react";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { useIsFetching } from "react-query";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import "./Header.css";
import dayjs from "dayjs";

function MHQTime() {
  const [_, update] = useState(0);
  const [mode, setMode] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => update(i => i + 1));
    return () => { clearInterval(interval) };
  }, []);
  return (
    <IonButtons slot="end">
      <IonButton onClick={() => setMode(s => s + 1)}>
        <div className="mhq-time">
          <h6>{dayjs.mhqNow().format(mode % 2 === 0 ? "LT" : "LTS")}</h6>
          <div>{mode % 2 === 1 ? dayjs.mhqNow().format("L") : "MHQ"}</div>
        </div>
      </IonButton>
    </IonButtons>
  );;
}

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
  const { t } = useTranslation();
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
          <IonBackButton text={t("pages:back")} />
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        <MHQTime />
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
