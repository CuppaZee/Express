import { IonAvatar, IonIcon, IonLabel, IonTabBar, IonTabButton, useIonRouter } from "@ionic/react";
import { grid, gridOutline, people, peopleOutline, search, searchOutline, shield, shieldOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { AccountsStorage } from "../storage/Account";
import useStorage from "../utils/useStorage";
import useUserSettings from "../utils/useUserSettings";
import useWindowSize from "../utils/useWindowSize";

export default function Tabs() {
  const [accounts] = useStorage(AccountsStorage);
  const history = useIonRouter();
  const { t } = useTranslation();
  const {width} = useWindowSize();
  const { users, clans } = useUserSettings() ?? {};
  if (width > 900) return null;
  return (
    <IonTabBar
      className="main-tab-bar"
      data-len={
        2 +
        (Object.values(accounts).filter(i => i.primary).length ? 1 : 0) +
        (clans?.length ? 1 : 0) +
        (users?.find(i => i.user_id !== Object.values(accounts).find(i => i.primary)?.user_id)
          ? 1
          : 0)
      }
      slot="bottom"
      onIonTabsDidChange={e => {
        history.push(e.detail.tab, "root");
      }}>
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/search")} tab="/search">
        <IonIcon icon={searchOutline} />
        <IonLabel>{t("pages:search")}</IonLabel>
      </IonTabButton>
      {Object.values(accounts)
        .filter(i => i.primary)
        .slice(0, 1)
        .map(acc => (
          <IonTabButton
            key={acc.username}
            selected={history.routeInfo.pathname.startsWith(`/player/${acc.username}`)}
            tab={`/player/${acc.username}`}>
            <IonIcon style={{ display: "none" }} />
            <IonAvatar className="tab-icon-avatar">
              <img
                src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                  acc.user_id
                ).toString(36)}.png`}
              />
            </IonAvatar>
            <IonLabel>{acc.username}</IonLabel>
          </IonTabButton>
        ))}
      {!!users?.find(i => i.user_id !== Object.values(accounts).find(i => i.primary)?.user_id) && (
        <IonTabButton selected={history.routeInfo.pathname.startsWith("/players")} tab="/players">
          <IonIcon icon={peopleOutline} />
          <IonLabel>{t("pages:players")}</IonLabel>
        </IonTabButton>
      )}
      {(clans?.length ?? 0) === 1 ? (
        <IonTabButton
          key={clans?.[0]?.name}
          selected={history.routeInfo.pathname.startsWith(`/clan/${clans?.[0]?.clan_id}`)}
          tab={`/clan/${clans?.[0]?.clan_id}`}>
          <IonIcon style={{ display: "none" }} />
          <IonAvatar className="tab-icon-avatar">
            <img
              src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                clans?.[0]?.clan_id
              ).toString(36)}.png`}
            />
          </IonAvatar>
          <IonLabel>{clans?.[0]?.name}</IonLabel>
        </IonTabButton>
      ) : (clans?.length ?? 0) > 0 ? (
        <IonTabButton selected={history.routeInfo.pathname.startsWith("/clans")} tab="/clans">
          <IonIcon icon={shieldOutline} />
          <IonLabel>{t("pages:clans")}</IonLabel>
        </IonTabButton>
      ) : null}
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/more")} tab="/more">
        <IonIcon icon={gridOutline} />
        <IonLabel>{t("pages:more")}</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
}
