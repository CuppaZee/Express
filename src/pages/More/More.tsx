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
  IonCardHeader,
  IonCardTitle,
  IonNote,
} from "@ionic/react";
import "./Settings.css";
import Header from "../../components/Header";
import { useTranslation } from "react-i18next";
import Tabs from "../../components/Tabs";
import { brushOutline, cafeOutline, chatbubblesOutline, globeOutline, gridOutline, heartOutline, linkOutline, logoFacebook, logoGithub, mapOutline, micOutline, openOutline, peopleCircleOutline, playCircleOutline, settingsOutline } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { Groups, UsefulLinks } from "./tools";

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
          <IonItem detail={false}>
            <IonIcon slot="start" icon={gridOutline} />
            <IonLabel>{t("pages:more")}</IonLabel>
          </IonItem>
          <IonItem detail lines="none" routerLink="/more/settings">
            <IonIcon slot="start" icon={settingsOutline} />
            <IonLabel>{t("pages:settings")}</IonLabel>
          </IonItem>
        </IonCard>
        <IonCard>
          <IonItem detail routerLink="/more/credits">
            <IonIcon slot="start" icon={peopleCircleOutline} />
            <IonLabel>{t("pages:more_contributors")}</IonLabel>
          </IonItem>
          <IonItem
            detailIcon={openOutline}
            lines="none"
            href={`https://github.com/CuppaZee`}
            onClick={e => {
              e.preventDefault();
              Browser.open({ url: e.currentTarget.href ?? "" });
            }}>
            <IonIcon slot="start" icon={logoGithub} />
            <IonLabel>{t("pages:more_github")}</IonLabel>
          </IonItem>
          <IonItem
            detailIcon={openOutline}
            lines="none"
            href={`https://ko-fi.com/sohcah`}
            onClick={e => {
              e.preventDefault();
              Browser.open({ url: e.currentTarget.href ?? "" });
            }}>
            <IonIcon slot="start" icon={cafeOutline} />
            <IonLabel>{t("pages:more_kofi")}</IonLabel>
          </IonItem>
          <IonItem
            detailIcon={openOutline}
            lines="none"
            href={`https://patreon.com/CuppaZee`}
            onClick={e => {
              e.preventDefault();
              Browser.open({ url: e.currentTarget.href ?? "" });
            }}>
            <IonIcon slot="start" icon={heartOutline} />
            <IonLabel>{t("pages:more_patreon")}</IonLabel>
          </IonItem>
        </IonCard>
        <IonCard className="useful-links-card">
          <IonItem detail={false}>
            <IonIcon slot="start" icon={linkOutline} />
            <IonLabel>{t("pages:more_links")}</IonLabel>
          </IonItem>
          {UsefulLinks.map(i => (
            <IonItem
              key={i.name}
              detailIcon={openOutline}
              lines="none"
              href={i.link}
              onClick={e => {
                e.preventDefault();
                Browser.open({ url: e.currentTarget.href ?? "" });
              }}>
              <IonIcon slot="start" icon={i.icon} />
              <div>
                <IonLabel>{i.name}</IonLabel>
                <IonNote>{i.description}</IonNote>
              </div>
            </IonItem>
          ))}
        </IonCard>
        <IonCard className="useful-links-card">
          <IonItem detail={false}>
            <IonIcon slot="start" icon={chatbubblesOutline} />
            <IonLabel>{t("pages:more_groups")}</IonLabel>
          </IonItem>
          {Groups.map(i => (
            <IonItem
              key={i.name}
              detailIcon={logoFacebook}
              lines="none"
              href={i.link}
              onClick={e => {
                e.preventDefault();
                Browser.open({ url: e.currentTarget.href ?? "" });
              }}>
              <IonIcon slot="start" icon={i.icon} />
              <div>
                <IonLabel>{i.name}</IonLabel>
                <IonNote>{i.description}</IonNote>
              </div>
            </IonItem>
          ))}
        </IonCard>
      </IonContent>
      <Tabs />
    </IonPage>
  );
}

export default More;
