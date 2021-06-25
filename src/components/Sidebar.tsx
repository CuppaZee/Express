import {
  IonCard,
  IonMenu,
  useIonRouter,
  IonItem,
  IonAvatar,
  IonImg,
  IonLabel,
  IonIcon,
  IonContent,
  IonHeader,
  IonToolbar,IonTitle, IonButtons, IonPage, IonButton
} from "@ionic/react";
import { heartOutline, peopleOutline, reload, searchOutline, settingsOutline, shieldOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import useUserSettings from "../utils/useUserSettings";
import useWindowSize from "../utils/useWindowSize";
import "./Sidebar.css"

export default function Sidebar() {
  const history = useIonRouter();
  const { t } = useTranslation();
  const page = (page: string) => ({
    routerDirection: "root" as const,
    routerLink: page,
    color: history.routeInfo?.pathname.startsWith(page) ? "primary" : undefined,
  });
  const { users, clans } = useUserSettings() ?? {};
  const queryClient = useQueryClient();
  const { width } = useWindowSize();
  return (
    <IonMenu
      style={width > 900 ? { maxWidth: "max(250px, min(350px, 27%))" } : undefined}
      contentId="ion-router-outlet">
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Express</IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={() => {
                  queryClient.refetchQueries({ active: true });
                }}>
                <IonIcon icon={reload} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonItem detail={false} lines="none" {...page("/search")}>
              <IonIcon slot="start" icon={searchOutline} />
              <IonLabel>{t("pages:search")}</IonLabel>
            </IonItem>
          </IonCard>
          <IonCard>
            <IonItem detail={false} {...page("/players")}>
              <IonIcon slot="start" icon={peopleOutline} />
              <IonLabel>{t("pages:players")}</IonLabel>
            </IonItem>
            {users?.map(user => (
              <IonItem
                key={user.user_id}
                lines="none"
                detail={false}
                {...page(`/player/${user.username}`)}>
                <IonAvatar className="item-avatar" slot="start">
                  <IonImg
                    src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                      user.user_id
                    ).toString(36)}.png`}
                  />
                </IonAvatar>
                <IonLabel>{user.username}</IonLabel>
              </IonItem>
            ))}
          </IonCard>
          <IonCard>
            <IonItem detail={false} {...page("/clans")}>
              <IonIcon slot="start" icon={shieldOutline} />
              <IonLabel>{t("pages:clans")}</IonLabel>
            </IonItem>
            {clans?.map(clan => (
              <IonItem
                key={clan.clan_id}
                lines="none"
                detail={false}
                {...page(`/clan/${clan.clan_id}`)}>
                <IonAvatar className="item-avatar" slot="start">
                  <IonImg
                    src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                      clan.clan_id
                    ).toString(36)}.png`}
                  />
                </IonAvatar>
                <IonLabel>{clan.name}</IonLabel>
              </IonItem>
            ))}
          </IonCard>
          <IonCard>
            <IonItem detail={false} lines="none" {...page("/more/settings")}>
              <IonIcon slot="start" icon={settingsOutline} />
              <IonLabel>{t("pages:settings")}</IonLabel>
            </IonItem>
            <IonItem detail={false} lines="none" {...page("/more/credits")}>
              <IonIcon slot="start" icon={heartOutline} />
              <IonLabel>{t("pages:more_credits")}</IonLabel>
            </IonItem>
          </IonCard>
        </IonContent>
      </IonPage>
    </IonMenu>
  );
}
