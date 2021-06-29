import {
  IonButton,
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

import React, { useMemo, useRef, useState } from "react";
import useUserID from "../../utils/useUserID";
import CZRefresher from "../../components/CZRefresher";
import Tabs from "../../components/Tabs";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import { generateInventoryData, UserInventoryInputData } from "@cuppazee/utils";
import InventoryImg from "../../components/Inventory/InventoryImg";
import useDB from "../../utils/useDB";
import { RouteChildrenProps } from "react-router";
import { useTranslation } from "react-i18next";
import useFancyGrid from "../../utils/useFancyGrid";
import useStorage from "../../utils/useStorage";
import { InventorySettingsStorage } from "../../storage/Inventory";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

const UserInventoryPage: React.FC<RouteChildrenProps<{ username: string }>> = ({ match }) => {
  const params = match?.params;
  const { t } = useTranslation();
  const [invSettings, setInvSettings] = useStorage(InventorySettingsStorage);
  const userID = useUserID(params?.username);
  const data = useCuppaZeeData<{ data?: UserInventoryInputData }>({
    endpoint: "user/inventory",
    params: {},
    options: { enabled: !!userID },
    user_id: userID,
  });
  const db = useDB();
  const d = useMemo(
    () => (data.data?.data ? generateInventoryData(db, data.data.data, invSettings) : undefined),
    [db, data.dataUpdatedAt, invSettings]
  );
  const [history, setHistory] = useState(false);

  const [gridRef, elements] = useFancyGrid(
    (history ? d?.history.length : d?.groups.length) || 0,
    350,
  );

  return (
    <IonPage>
      <Header title={`${params?.username} - ${t("pages:player_inventory")}`}>
        <IonSegment
          value={history ? "history" : "overview"}
          onIonChange={e => {
            setHistory(e.detail.value === "history");
          }}>
          <IonSegmentButton value="overview">
            <IonLabel>{t("user_inventory:overview")}</IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="history">
            <IonLabel>{t("user_inventory:history")}</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </Header>

      <IonContent fullscreen>
        <CZRefresher queries={[data]} />
        <div ref={gridRef}>
          {!history ? (
            <>
              <IonItem>
                <IonLabel>{t("user_inventory:settings_zero")}</IonLabel>
                <IonCheckbox
                  slot="end"
                  onIonChange={ev =>
                    setInvSettings({ ...invSettings, hideZeroes: !ev.detail.checked })
                  }
                  checked={!invSettings.hideZeroes}
                />
              </IonItem>
              <IonItem>
                <IonLabel>{t("user_inventory:settings_group")}</IonLabel>
                <IonCheckbox
                  slot="end"
                  onIonChange={ev =>
                    setInvSettings({ ...invSettings, groupByState: !ev.detail.checked })
                  }
                  checked={!invSettings.groupByState}
                />
              </IonItem>
              <div className="fancy-grid-wrapper">
                {d?.groups.map((g, n) => (
                  <div className="inventory-overview-card-wrapper" style={elements[n]}>
                    <IonCard
                      key={`card_${"state" in g ? g.state : g.category.id}`}
                      className="inventory-overview-card">
                      <IonCardHeader>
                        <IonCardTitle>
                          {"state" in g
                            ? t(`user_inventory:state_${g.state}` as const)
                            : g.category.name}{" "}
                          ({g.total})
                        </IonCardTitle>
                      </IonCardHeader>
                      {"category" in g && (g.category.accessories?.length ?? 0) > 0 && (
                        <IonCardContent className="inventory-row">
                          {g.category.accessories
                            ?.filter(i => Capacitor.isNativePlatform() || i.link.startsWith("http"))
                            .map(i => (
                              <IonButton
                                size="small"
                                color={i.color}
                                href={i.link.startsWith("~") ? i.link.slice(1) : i.link}
                                onClick={e => {
                                  e.preventDefault();
                                  Browser.open({ url: e.currentTarget.href ?? "" });
                                }}>
                                {i.label}
                              </IonButton>
                            ))}
                        </IonCardContent>
                      )}
                      <IonCardContent className="inventory-row">
                        {g.types?.map(i => (
                          <InventoryImg key={i.icon ?? i.name ?? i.type?.name ?? ""} item={i} />
                        ))}
                      </IonCardContent>
                    </IonCard>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="fancy-grid-wrapper">
              {d?.history.map((g, n) => (
                <div className="inventory-overview-card-wrapper" style={elements[n]}>
                  <IonCard
                    key={`card_${g.title}_${g.time.format()}`}
                    className="inventory-history-card">
                    <IonCardHeader>
                      <IonCardSubtitle>{g.time.format("L LT")}</IonCardSubtitle>
                      <IonCardTitle className="small">
                        {typeof g.title === "string" ? g.title : t(g.title[0] as any, g.title[1])}
                      </IonCardTitle>
                      {g.description && <IonText>{g.description}</IonText>}
                    </IonCardHeader>
                    <IonCardContent className="inventory-row">
                      {g.types.map(i => (
                        <InventoryImg key={i.icon ?? i.name ?? i.type?.name ?? ""} item={i} />
                      ))}
                    </IonCardContent>
                  </IonCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UserInventoryPage;
