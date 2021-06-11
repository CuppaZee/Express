import {
  IonAvatar,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
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
import { bagHandleOutline, calendarOutline, shieldOutline } from "ionicons/icons";
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
import useCZParams from "../../utils/useCZParams";
import useDB from "../../utils/useDB";
import { CZTypeImg } from "../../components/CZImg";
import useCuppaZeeData from "../../utils/useCuppaZeeData";

interface UserCuppaZeeData {
  shadowClan: {
    clan_id: number;
    group: string;
    group_admins: string[];
    name?: string;
  };
}

const UserMainPage: React.FC = () => {
  // alert('render');
  const params = useCZParams<{ username: string }>("/user/:username");
  const userID = useUserID(params?.username);
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
          {/* <IonCardContent>
            <IonCardSubtitle>
              Level {user.data?.data?.level} - {user.data?.data?.points.toLocaleString()} Points
            </IonCardSubtitle>
            <IonCardTitle>{user.data?.data?.username ?? params?.username}</IonCardTitle>
          </IonCardContent> */}
          <IonItem
            detail
            routerLink={`/user/${user.data?.data?.username ?? params?.username}/activity`}>
            <IonIcon slot="start" icon={calendarOutline} />
            <IonLabel>Activity</IonLabel>
          </IonItem>
          <IonItem
            detail
            routerLink={`/user/${user.data?.data?.username ?? params?.username}/inventory`}>
            <IonIcon slot="start" icon={bagHandleOutline} />
            <IonLabel>Inventory</IonLabel>
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
                  src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${
                    Number(user.data?.data?.clan?.id ?? userCuppaZee.data?.data.shadowClan?.clan_id).toString(36)
                  }.png`}
                />
              </IonAvatar>
              <IonLabel>
                {(user.data?.data?.clan ?? userCuppaZee.data?.data.shadowClan)?.name ?? "??? Shadow Clan ???"}
              </IonLabel>
            </IonItem>
          )}
          {!user.data?.data?.clan && (
            <IonItem disabled lines="none" detail>
              <IonIcon slot="start" icon={shieldOutline} />
              <IonLabel>Clan Progress</IonLabel>
            </IonItem>
          )}
        </IonCard>
        <IonCard>
          {db.categories
            .filter(i => i.parents.some(i => i?.id === "root"))
            .map(i => (
              <IonItem
                detail
                routerLink={`/user/${user.data?.data?.username ?? params?.username}/captures/${
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
