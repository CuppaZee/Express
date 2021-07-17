import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage, IonText } from "@ionic/react";
import { useEffect, useState } from "react";
import { RouteChildrenProps, useParams } from "react-router";
import Header from "../../components/Header";

import { registerPlugin } from "@capacitor/core";
import { App } from "@capacitor/app";

export interface WidgetPref {
  get(v: { key: string; defaultValue: string }): Promise<{ value: string }>;
  set(v: { key: string; value: string }): Promise<void>;
}

const WidgetPreferences = registerPlugin<WidgetPref | undefined | null>("WidgetPreferences");

export default function AndroidWidgetConfigurePage({ match }: RouteChildrenProps<{ id: string }>) {
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    const id = match?.params.id;
    if (id) {
      setDone(false);
      WidgetPreferences?.get({ key: "activity_widget_" + id, defaultValue: "" }).then(i =>
        setValue(i?.value ?? "")
      );
    }
  }, [match?.params.id]);
  return (
    <IonPage>
      <Header title="Configure Android Widget" />
      {done ? (
        <IonContent>
          <h6>Saved</h6>
        </IonContent>
      ) : (
        <IonContent>
          <IonItem>
            <IonLabel>Username</IonLabel>
            <IonInput
              slot="end"
              placeholder="eg. sohcah"
              value={value}
              onIonChange={ev => {
                setValue(ev.detail.value ?? "");
              }}
            />
          </IonItem>
          <IonButton
            onClick={() => {
              WidgetPreferences?.set({ key: "activity_widget_" + match?.params.id, value });
              setDone(true);
            }}>
            Save
          </IonButton>
        </IonContent>
      )}
    </IonPage>
  );
}
