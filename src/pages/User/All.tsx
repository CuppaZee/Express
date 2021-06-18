import {
  IonAvatar,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./All.css";
import { bagHandleOutline, calendarOutline, cubeOutline, shieldOutline } from "ionicons/icons";
import Header from "../../components/Header";

import { generateUserActivityData } from "@cuppazee/utils";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import useUserID from "../../utils/useUserID";
import useActivity from "../../utils/useActivity";
import dayjs from "dayjs";
import useMunzeeData from "../../utils/useMunzeeData";
import CZRefresher from "../../components/CZRefresher";
import ActivityOverview from "../../components/Activity/ActivityOverview";
import Tabs from "../../components/Tabs";
import useDB from "../../utils/useDB";
import { RouteChildrenProps } from "react-router";
import { UseQueryResult } from "react-query";
import useStorage from "../../utils/useStorage";
import { AccountsStorage } from "../../storage/Account";
import useUserSettings from "../../utils/useUserSettings";

const UserCard: React.FC<{ id: number; queries: MutableRefObject<Set<UseQueryResult>> }> = ({ id, queries }) => {
  const day = dayjs.mhqNow();
  const data = useActivity(id, day.format("YYYY-MM-DD"));
  const user = useMunzeeData({
    endpoint: "user",
    params: { user_id: id },
  });
  const db = useDB();
  const d = useMemo(
    () =>
      data.data
        ? generateUserActivityData(
            db,
            data.data.data,
            {
              activity: new Set(),
              category: new Set(),
              state: new Set(),
            },
            user.data?.data?.username
          )
        : undefined,
    [data.dataUpdatedAt, db, user.data?.data?.username]
  );
  useEffect(() => {
    queries.current.add(data);
    queries.current.add(user);
    return () => {
      queries.current.delete(data);
      queries.current.delete(user);
    }
  }, [data, user]);
  return (
    <IonCard>
      <IonItem lines="none" detail routerLink={`/player/${user.data?.data?.username}`}>
        <IonAvatar className="item-avatar" slot="start">
          <IonImg
            src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${id.toString(36)}.png`}
          />
        </IonAvatar>
        <IonLabel>{user.data?.data?.username}</IonLabel>
      </IonItem>
      <ActivityOverview d={d} day={day} />
    </IonCard>
  );
}

const UsersPage: React.FC = () => {
  const queriesRef = useRef<Set<UseQueryResult>>(new Set());
  const { users } = useUserSettings() ?? {};
  return (
    <IonPage>
      <Header title="Players" />
      <IonContent fullscreen>
        <CZRefresher queries={queriesRef} />
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Players</IonTitle>
          </IonToolbar>
        </IonHeader>
        {users?.map(i => (
          <UserCard queries={queriesRef} id={i.user_id} />
        ))}
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UsersPage;
