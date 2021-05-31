import { IonAvatar, IonIcon, IonLabel, IonTabBar, IonTabButton, useIonRouter } from "@ionic/react";
import { grid, search } from "ionicons/icons";
import { AccountsStorage } from "../storage/Account";
import useStorage from "../utils/useStorage";

export default function Tabs() {
  const [accounts] = useStorage(AccountsStorage);
  const history = useIonRouter();
  return (
    <IonTabBar
      slot="bottom"
      onIonTabsDidChange={e => {
        history.push(e.detail.tab, "root");
      }}>
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/search")} tab="/search">
        <IonIcon icon={search} />
        <IonLabel>Search</IonLabel>
      </IonTabButton>
      {Object.values(accounts).map(acc => (
        <IonTabButton
          key={acc.username}
          selected={history.routeInfo.pathname.startsWith(`/user/${acc.username}`)}
          tab={`/user/${acc.username}`}>
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
      <IonTabButton selected={history.routeInfo.pathname.startsWith("/more")} tab="/more">
        <IonIcon icon={grid} />
        <IonLabel>More</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
}
