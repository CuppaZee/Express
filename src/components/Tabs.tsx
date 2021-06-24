import { IonAvatar, IonIcon, IonLabel, IonTabBar, IonTabButton, useIonRouter } from "@ionic/react";
import { grid, people, search, shield } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { AccountsStorage } from "../storage/Account";
import useStorage from "../utils/useStorage";
import useUserSettings from "../utils/useUserSettings";
import useWindowSize from "../utils/useWindowSize";

export default function Tabs() {
  const [accounts] = useStorage(AccountsStorage);
  const history = useIonRouter();
  const { t } = useTranslation();
  const screen = useWindowSize();
  const { users, clans } = useUserSettings() ?? {};
  if ((screen?.width ?? 0) > 900) return null;
  return (
    <IonTabBar
      slot="bottom"
      onIonTabsDidChange={e => {
        history.push(e.detail.tab, "root");
      }}>
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/search")} tab="/search">
        <IonIcon icon={search} />
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
      {!!users?.find(i=>i.user_id !== Object.values(accounts)
        .find(i => i.primary)?.user_id) && (
        <IonTabButton selected={history.routeInfo.pathname.startsWith("/players")} tab="/players">
          <IonIcon icon={people} />
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
      ) : ((clans?.length ?? 0) > 0 ? (
        <IonTabButton selected={history.routeInfo.pathname.startsWith("/clans")} tab="/clans">
          <IonIcon icon={shield} />
          <IonLabel>{t("pages:clans")}</IonLabel>
        </IonTabButton>
      ) : null)}
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/more")} tab="/more">
        <IonIcon icon={grid} />
        <IonLabel>{t("pages:more")}</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
}
