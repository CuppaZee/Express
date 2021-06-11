import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonItem,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonSegment,
  IonSegmentButton,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonText,
} from "@ionic/react";
import "./Inventory.css";
import Header from "../../components/Header";

import React, { useMemo, useState } from "react";
import useUserID from "../../utils/useUserID";
import CZRefresher from "../../components/CZRefresher";
import Tabs from "../../components/Tabs";
import useCZParams from "../../utils/useCZParams";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import { generateInventoryData, UserInventoryInputData } from "@cuppazee/utils";
import InventoryImg from "../../components/Inventory/InventoryImg";
import useDB from "../../utils/useDB";

const UserInventoryPage: React.FC = () => {
  const [hideZeroes, setHideZeroes] = React.useState(false);
  const [groupByState, setGroupByState] = React.useState(false);
  const params = useCZParams<{ username: string }>("/user/:username/inventory");
  const userID = useUserID(params?.username);
  const data = useCuppaZeeData<{ data: UserInventoryInputData }>({
    endpoint: "user/inventory",
    params: {},
    options: { enabled: !!userID },
    user_id: userID,
  });
  const db = useDB();
  const d = useMemo(
    () =>
      data.data
        ? generateInventoryData(db, data.data.data, { hideZeroes, groupByState })
        : undefined,
    [db, data.dataUpdatedAt, hideZeroes, groupByState]
  );
  const [history, setHistory] = useState(false);

  return (
    <IonPage>
      <Header title={`${params?.username} - Inventory`}>
        <IonSegment
          value={history ? "history" : "overview"}
          onIonChange={e => {
            setHistory(e.detail.value === "history");
          }}>
          <IonSegmentButton value="overview">
            <IonLabel>Overview</IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="history">
            <IonLabel>History</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </Header>

      <IonContent fullscreen>
        <CZRefresher queries={[data]} />
        {!history ? (
          <>
            <IonItem>
              <IonLabel>Hide Zeroes</IonLabel>
              <IonCheckbox
                slot="end"
                onIonChange={ev => setHideZeroes(ev.detail.checked)}
                checked={hideZeroes}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Group by State</IonLabel>
              <IonCheckbox
                slot="end"
                onIonChange={ev => setGroupByState(ev.detail.checked)}
                checked={groupByState}
              />
            </IonItem>
            {d?.groups.map(g => (
              <IonCard
                key={`card_${"state" in g ? g.state : g.category.id}`}
                className="inventory-overview-card">
                <IonCardHeader>
                  <IonCardTitle>
                    {"state" in g ?  g.state : g.category.name} ({g.total})
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="inventory-row">
                  {g.types?.map(i => (
                    <InventoryImg key={i.icon ?? i.name ?? i.type?.name ?? ""} item={i} />
                  ))}
                </IonCardContent>
              </IonCard>
            ))}
          </>
        ) : (
          <>
            {d?.history.map(g => (
              <IonCard
                key={`card_${g.title}_${g.time.format()}`}
                className="inventory-history-card">
                <IonCardHeader>
                  <IonCardSubtitle>{g.time.format("L LT")}</IonCardSubtitle>
                  <IonCardTitle className="small">
                    {typeof g.title === "string" ? g.title : g.title[0].slice(15)}
                  </IonCardTitle>
                  {g.description && <IonText>{g.description}</IonText>}
                </IonCardHeader>
                <IonCardContent className="inventory-row">
                  {g.types.map(i => (
                    <InventoryImg key={i.icon ?? i.name ?? i.type?.name ?? ""} item={i} />
                  ))}
                </IonCardContent>
              </IonCard>
            ))}
          </>
        )}
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UserInventoryPage;
