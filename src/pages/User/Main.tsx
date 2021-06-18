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
import "./Main.css";
import { bagHandleOutline, calendarOutline, cubeOutline, shieldOutline } from "ionicons/icons";
import Header from "../../components/Header";

import { generateUserActivityData } from "@cuppazee/utils";
import { useMemo } from "react";
import useUserID from "../../utils/useUserID";
import useActivity from "../../utils/useActivity";
import dayjs from "dayjs";
import useMunzeeData from "../../utils/useMunzeeData";
import CZRefresher from "../../components/CZRefresher";
import ActivityOverview from "../../components/Activity/ActivityOverview";
import Tabs from "../../components/Tabs";
import useDB from "../../utils/useDB";
import { CZTypeImg } from "../../components/CZImg";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import { RouteChildrenProps } from "react-router";
import { useTranslation } from "react-i18next";

interface UserCuppaZeeData {
  shadowClan: {
    clan_id: number;
    group: string;
    group_admins: string[];
    name?: string;
  };
}

const UserMainPage: React.FC<RouteChildrenProps<{ username: string }>> = ({
  match,
}) => {
  const params = match?.params;
  const userID = useUserID(params?.username);
  const { t } = useTranslation();
  const day = dayjs.mhqNow();
  const db = useDB();
  const data = useActivity(userID || undefined, day.format("YYYY-MM-DD"));
  const user = useMunzeeData({
    endpoint: "user",
    params: { username: params?.username ?? "" },
  });
  const userCuppaZee = useCuppaZeeData<{ data: UserCuppaZeeData }>({
    endpoint: "user/cuppazee",
    params: { user_id: userID },
    options: {
      enabled: !!userID,
    },
  });
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
            params?.username
          )
        : undefined,
    [data.dataUpdatedAt, db]
  );
  return (
    <IonPage>
      <Header title={params?.username} />
      <IonContent fullscreen>
        <CZRefresher queries={[user, data]} />
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{params?.username}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonCard>
          <ActivityOverview d={d} day={day} />
        </IonCard>
        <IonCard>
          <IonItem
            detail
            routerLink={`/player/${user.data?.data?.username ?? params?.username}/activity`}>
            <IonIcon slot="start" icon={calendarOutline} />
            <IonLabel>{t("pages:user_activity")}</IonLabel>
          </IonItem>
          <IonItem
            detail
            routerLink={`/player/${user.data?.data?.username ?? params?.username}/inventory`}>
            <IonIcon slot="start" icon={bagHandleOutline} />
            <IonLabel>{t("pages:user_inventory")}</IonLabel>
          </IonItem>
          <IonItem
            detail
            routerLink={`/player/${user.data?.data?.username ?? params?.username}/qrates`}>
            <IonIcon slot="start" icon={cubeOutline} />
            <IonLabel>{t("pages:user_qrates")}</IonLabel>
          </IonItem>
          {(user.data?.data?.clan || userCuppaZee.data?.data.shadowClan) && (
            <IonItem
              lines="none"
              detail
              routerLink={`/clan/${
                user.data?.data?.clan?.id ?? userCuppaZee.data?.data.shadowClan?.clan_id
              }`}>
              <IonAvatar className="item-avatar" slot="start">
                <IonImg
                  src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                    user.data?.data?.clan?.id ?? userCuppaZee.data?.data.shadowClan?.clan_id
                  ).toString(36)}.png`}
                />
              </IonAvatar>
              <IonLabel>
                {(user.data?.data?.clan ?? userCuppaZee.data?.data.shadowClan)?.name ??
                  "??? Shadow Clan ???"}
              </IonLabel>
            </IonItem>
          )}
          {!user.data?.data?.clan && (
            <IonItem disabled lines="none" detail>
              <IonIcon slot="start" icon={shieldOutline} />
              <IonLabel>{t("pages:user_clan_progress")}</IonLabel>
            </IonItem>
          )}
        </IonCard>
        <IonCard>
          {db.categories
            .filter(i => i.parents.some(i => i?.id === "root"))
            .map(i => (
              <IonItem
                key={i.id}
                detail
                routerLink={`/player/${user.data?.data?.username ?? params?.username}/captures/${
                  i.id
                }`}>
                <CZTypeImg img={i.icon} slot="start" className="user-captures-image" />
                <IonLabel>{i.name}</IonLabel>
              </IonItem>
            ))}
        </IonCard>
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UserMainPage;
