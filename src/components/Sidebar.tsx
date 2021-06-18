import { IonAvatar, IonIcon, IonLabel, IonTabBar, IonTabButton, useIonRouter } from "@ionic/react";
import { grid, people, search, shield } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { AccountsStorage } from "../storage/Account";
import useStorage from "../utils/useStorage";

export default function Sidebar() {
  const [accounts] = useStorage(AccountsStorage);
  const history = useIonRouter();
  const { t } = useTranslation();
  return (
    <IonTabBar
      slot="bottom"
      onIonTabsDidChange={e => {
        history.push(e.detail.tab, "root");
      }}>
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/search")} tab="/search">
        <IonIcon icon={search} />
        <IonLabel>{t("pages:tools_search")}</IonLabel>
      </IonTabButton>
      {Object.values(accounts)
        .filter(i => i.primary)
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
      {Object.values(accounts).length > 1 && <IonTabButton selected={history.routeInfo.pathname.startsWith("/players")} tab="/players">
        <IonIcon icon={people} />
        <IonLabel>Players</IonLabel>
      </IonTabButton>}
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/clans")} tab="/clans">
        <IonIcon icon={shield} />
        <IonLabel>Clans</IonLabel>
      </IonTabButton>
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/more")} tab="/more">
        <IonIcon icon={grid} />
        <IonLabel>More</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
}
