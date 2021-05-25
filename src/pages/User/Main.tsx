import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Main.css";
import { useParams } from "react-router";
import { bagHandleOutline, calendarOutline, shieldOutline } from "ionicons/icons";
import Header from "../../components/Header";

import { generateUserActivityData } from "@cuppazee/utils";
import { useMemo } from "react";
import useUserID from "../../utils/useUsername";
import useActivity from "../../utils/useActivity";
import dayjs from "dayjs";
import ActivityImg from "../../components/Activity/ActivityImg";
import { CZLoadText } from "../../components/CZLoad";

const UserMainPage: React.FC = () => {
  const params = useParams<{ username: string }>();
  const userID = useUserID(params.username);
  const day = dayjs.mhqNow();
  const data = useActivity(userID || undefined, day.format("YYYY-MM-DD"));
  const d = useMemo(
    () =>
      data.data
        ? generateUserActivityData(
            data.data.data,
            {
              activity: new Set(),
              category: new Set(),
              state: new Set(),
            },
            params.username
          )
        : undefined,
    [data.dataUpdatedAt]
  );
  return (
    <>
      <Header title={params.username} />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{params.username}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>{day.format("L")}</IonCardSubtitle>
            <IonCardTitle>
              <CZLoadText loading={!d}>{d?.points} Points</CZLoadText>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="activity-wrapper activity-wrapper-centred">
            <h2>
              <CZLoadText loading={!d}>
                {d?.overview.capture?.count ?? 0} Captures - {d?.overview.capture?.points ?? 0}{" "}
                Points
              </CZLoadText>
            </h2>
            <div className="activity-row">
              {d ? (
                Object.entries(d?.overview.capture?.types ?? {}).map(([a, b], _, l) => (
                  <ActivityImg small={l.length >= 20} icon={a.slice(49, -4)} amount={b.count} />
                ))
              ) : (
                <>
                  <IonSkeletonText animated className="activity-img-skeleton" />
                  <IonSkeletonText animated className="activity-img-skeleton" />
                </>
              )}
            </div>
            <h2>
              <CZLoadText loading={!d}>
                {d?.overview.deploy?.count ?? 0} Deploys - {d?.overview.deploy?.points ?? 0} Deploys
              </CZLoadText>
            </h2>
            <div className="activity-row">
              {Object.entries(d?.overview.deploy?.types ?? {}).map(([a, b], _, l) => (
                <ActivityImg small={l.length >= 20} icon={a.slice(49, -4)} amount={b.count} />
              ))}
            </div>
            <h2>
              <CZLoadText loading={!d}>
                {d?.overview.passive_deploy?.count ?? 0} Passive Deploys -{" "}
                {d?.overview.passive_deploy?.points ?? 0} Points
              </CZLoadText>
            </h2>
            <div className="activity-row">
              {Object.entries(d?.overview.passive_deploy?.types ?? {}).map(([a, b], _, l) => (
                <ActivityImg small={l.length >= 20} icon={a.slice(49, -4)} amount={b.count} />
              ))}
            </div>
            <h2>
              <CZLoadText loading={!d}>
                {d?.overview.capon?.count ?? 0} Capons - {d?.overview.capon?.points ?? 0} Points
              </CZLoadText>
            </h2>
            <div className="activity-row">
              {d ? (
                Object.entries(d?.overview.capon?.types ?? {}).map(([a, b], _, l) => (
                  <ActivityImg small={l.length >= 20} icon={a.slice(49, -4)} amount={b.count} />
                ))
              ) : (
                <>
                  <IonSkeletonText animated className="activity-img-skeleton" />
                  <IonSkeletonText animated className="activity-img-skeleton" />
                  <IonSkeletonText animated className="activity-img-skeleton" />
                </>
              )}
            </div>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardContent>
            <IonCardSubtitle>Level 122 - 4,870,953 Points</IonCardSubtitle>
            <IonCardTitle>sohcah</IonCardTitle>
          </IonCardContent>
          <IonItem detail>
            <IonIcon slot="start" icon={calendarOutline} />
            <IonLabel>Activity</IonLabel>
          </IonItem>
          <IonItem detail>
            <IonIcon slot="start" icon={bagHandleOutline} />
            <IonLabel>Inventory</IonLabel>
          </IonItem>
          <IonItem detail>
            <IonIcon slot="start" icon={shieldOutline} />
            <IonLabel>Clan Progress</IonLabel>
          </IonItem>
        </IonCard>
      </IonContent>
    </>
  );
};

export default UserMainPage;
