import { Browser } from "@capacitor/browser";
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
  IonToolbar,
  IonTitle,
  IonButtons,
  IonPage,
  IonButton,
  IonNote,
} from "@ionic/react";
import {
  brushOutline,
  cafeOutline,
  chatbubbleOutline,
  chatbubblesOutline,
  globeOutline,
  gridOutline,
  heartOutline,
  linkOutline,
  listOutline,
  logoFacebook,
  logoGithub,
  mapOutline,
  micOutline,
  openOutline,
  peopleCircleOutline,
  peopleOutline,
  playCircleOutline,
  reload,
  searchOutline,
  settingsOutline,
  shieldOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { Groups, UsefulLinks } from "../pages/More/tools";
import useUserSettings from "../utils/useUserSettings";
import useWindowSize from "../utils/useWindowSize";
import "./Sidebar.css";

export default function Sidebar() {
  const history = useIonRouter();
  const { t } = useTranslation();
  const page = (page: string, exact?: boolean) => ({
    routerDirection: "root" as const,
    routerLink: page,
    color: (
      exact ? history.routeInfo?.pathname === page : history.routeInfo?.pathname.startsWith(page)
    )
      ? "primary"
      : undefined,
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
            <IonItem detail={false} {...page("/clans", true)}>
              <IonIcon slot="start" icon={shieldOutline} />
              <IonLabel>{t("pages:clans")}</IonLabel>
            </IonItem>
            <IonItem detail={false} lines="none" {...page("/clans/requirements", true)}>
              <IonIcon slot="start" icon={listOutline} />
              <IonLabel>{t("pages:clan_requirements")}</IonLabel>
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
            <IonItem detail={false} {...page("/more", true)}>
              <IonIcon slot="start" icon={gridOutline} />
              <IonLabel>{t("pages:more")}</IonLabel>
            </IonItem>
            <IonItem detail={false} lines="none" {...page("/more/settings")}>
              <IonIcon slot="start" icon={settingsOutline} />
              <IonLabel>{t("pages:settings")}</IonLabel>
            </IonItem>
          </IonCard>
          <IonCard>
            <IonItem detail={false} {...page("/more/credits")}>
              <IonIcon slot="start" icon={peopleCircleOutline} />
              <IonLabel>Contributors</IonLabel>
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
              <IonLabel>GitHub</IonLabel>
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
              <IonLabel>My Ko-fi</IonLabel>
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
              <IonLabel>My Patreon</IonLabel>
            </IonItem>
          </IonCard>
          <IonCard className="useful-links-card">
            <IonItem detail={false}>
              <IonIcon slot="start" icon={linkOutline} />
              <IonLabel>Useful Links</IonLabel>
            </IonItem>
            {UsefulLinks.map(i => (
              <IonItem
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
              <IonLabel>Groups</IonLabel>
            </IonItem>
            {Groups.map(i => (
              <IonItem
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
      </IonPage>
    </IonMenu>
  );
}
