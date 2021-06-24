import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonItem,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import "./Settings.css";
import Header from "../../components/Header";
import { useTranslation } from "react-i18next";
import Tabs from "../../components/Tabs";
import { heartOutline, settingsOutline } from "ionicons/icons";

function More() {
  const { t } = useTranslation();
  const pageTitle = t("pages:more");
  return (
    <IonPage>
      <Header title={pageTitle} />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{pageTitle}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonCard>
          <IonItem detail lines="none" routerLink="/more/settings">
            <IonIcon slot="start" icon={settingsOutline} />
            <IonLabel>{t("pages:settings")}</IonLabel>
          </IonItem>
          <IonItem detail lines="none" routerLink="/more/credits">
            <IonIcon slot="start" icon={heartOutline} />
            <IonLabel>{t("pages:more_credits")}</IonLabel>
          </IonItem>
        </IonCard>
      </IonContent>
      <Tabs />
    </IonPage>
  );
}

export default More;
