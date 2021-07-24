import {
  IonAvatar,
  IonCard,
  IonContent,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./All.css";
import Header from "../../components/Header";

import { generateUserActivityData } from "@cuppazee/utils";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import useActivity from "../../utils/useActivity";
import dayjs from "dayjs";
import useMunzeeData from "../../utils/useMunzeeData";
import CZRefresher from "../../components/CZRefresher";
import ActivityOverview from "../../components/Activity/ActivityOverview";
import Tabs from "../../components/Tabs";
import useDB from "../../utils/useDB";
import { UseQueryResult } from "react-query";
import useUserSettings from "../../utils/useUserSettings";
import FancyGrid from "../../components/FancyGrid";
import { useTranslation } from "react-i18next";
import ZeeOpsOverview from "../../components/ZeeOps/Overview";
import useError, { CZError } from "../../components/CZError";

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
  const error = useError([data,user]);
  return (
    <IonCard>
      {error ? <CZError {...error} /> : <>
        <IonItem lines="none" detail routerLink={`/player/${user.data?.data?.username}`}>
          <IonAvatar className="item-avatar" slot="start">
            <IonImg
              src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${id.toString(36)}.png`}
            />
          </IonAvatar>
          <IonLabel>{user.data?.data?.username}</IonLabel>
        </IonItem>
        <ActivityOverview d={d} day={day} />
        {!!id && <ZeeOpsOverview user_id={id} />}
      </>}
    </IonCard>
  );
}

const UsersPage: React.FC = () => {
  const queriesRef = useRef<Set<UseQueryResult>>(new Set());
  const { users } = useUserSettings() ?? {};
  const { t } = useTranslation();
  return (
    <IonPage>
      <Header title="Players" />
      <IonContent fullscreen>
        <CZRefresher queries={queriesRef} />
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("pages:players")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <FancyGrid width={500}>
          {users?.map(i => (
            <UserCard queries={queriesRef} id={i.user_id} />
          ))}
        </FancyGrid>
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UsersPage;
