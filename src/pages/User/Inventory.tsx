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
  IonTitle,
} from "@ionic/react";
import "./Inventory.css";
import Header from "../../components/Header";

import React, { useMemo } from "react";
import useUserID from "../../utils/useUserID";
import CZRefresher from "../../components/CZRefresher";
import Tabs from "../../components/Tabs";
import useCZParams from "../../utils/useCZParams";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import {
  generateInventoryData,
  UserInventoryInputData,
} from "@cuppazee/utils";
import InventoryImg from "../../components/Inventory/InventoryImg";

const UserInventoryPage: React.FC = () => {
  const [hideZeroes, setHideZeroes] = React.useState(false);
  const [groupByState, setGroupByState] = React.useState(false);
  const params = useCZParams<{ username: string }>("/user/:username/inventory");
  const userID = useUserID(params?.username);
  const data = useCuppaZeeData<{ data: UserInventoryInputData }>({
    endpoint: "user/inventory",
    params: { user_id: userID },
    options: { enabled: !!userID },
  });
  const d = useMemo(
    () =>
      data.data ? generateInventoryData(data.data.data, { hideZeroes, groupByState }) : undefined,
    [data.dataUpdatedAt, hideZeroes, groupByState]
  );

  return (
    <IonPage>
      <Header title={`${params?.username} - Inventory`} />
      <IonContent fullscreen>
        <CZRefresher queries={[data]} />
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
                {"state" in g ? g.state : g.category.name} ({g.total})
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="inventory-row">
              {g.types?.map(i => (
                <InventoryImg key={i.icon ?? i.name ?? i.type?.name ?? ""} item={i} />
              ))}
            </IonCardContent>
          </IonCard>
        ))}
        <h1 className="inventory-history-title">History</h1>
        {d?.history.map(g => (
          <IonCard key={`card_${g.title}_${g.time.format()}`} className="inventory-history-card">
            <IonCardHeader>
              <IonCardSubtitle>{g.time.format("L LT")}</IonCardSubtitle>
              <IonCardTitle>
                {typeof g.title === "string" ? g.title : g.title[0].slice(15)}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="inventory-row">
              {g.types.map(i => (
                <InventoryImg key={i.icon ?? i.name ?? i.type?.name ?? ""} item={i} />
              ))}
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UserInventoryPage;
