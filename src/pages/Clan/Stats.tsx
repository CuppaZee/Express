import {
  IonAvatar,
  IonCard,
  IonContent,
  IonImg,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
} from "@ionic/react";
import Header from "../../components/Header";

import React, { useMemo } from "react";
import Tabs from "../../components/Tabs";
import useCZParams from "../../utils/useCZParams";
import useMunzeeData from "../../utils/useMunzeeData";
import { ClanShadowData, GameID, generateClanRequirements, generateClanStats, requirementMeta } from "@cuppazee/utils";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import "./Clan.css";

const ClanStatsPage: React.FC = () => {
  const params = useCZParams<{ id: string }>("/clan/:id");
  const clan = useMunzeeData({
    endpoint: "clan/v2",
    params: { clan_id: Number(params?.id) },
  });
  const requirements = useMunzeeData({
    endpoint: "clan/v2/requirements",
    params: { clan_id: Number(params?.id), game_id: new GameID().game_id },
  });
  const shadow = useCuppaZeeData<{ data: ClanShadowData }>({
    endpoint: "clan/shadow/v1",
    params: { clan_id: Number(params?.id), game_id: new GameID().game_id },
  });

  const reqs = useMemo(
    () =>
      requirements.data ? generateClanRequirements(requirements.data?.data) : null,
    [requirements.dataUpdatedAt]
  );

  const stats = useMemo(
    () => (clan.data && reqs ? generateClanStats(clan.data?.data, requirements.data?.data, reqs, Number(params?.id), shadow.data?.data) : null),
    [clan.dataUpdatedAt, requirements.dataUpdatedAt, reqs, shadow.dataUpdatedAt]
  );

  return (
    <IonPage>
      <Header title={`${params?.id} - Stats`} />
      <IonContent fullscreen>
        <IonCard>
          <IonItem lines="none">
            <IonAvatar slot="start">
              <IonImg
                src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                  params?.id
                ).toString(36)}.png`}
              />
            </IonAvatar>
            <div>
              <IonLabel>{clan.data?.data?.details.name}</IonLabel>
              <IonNote>{clan.data?.data?.details.tagline}</IonNote>
            </div>
          </IonItem>
          {stats && reqs && (
            <div className="clan-table clan-table-edg">
              <div className="clan-table-column">
                <div className="clan-table-cell clan-table-cell-header">
                  <div>{Object.values(stats.users).length} Players</div>
                  <div>Rank #{clan.data?.data?.result?.rank}</div>
                </div>
                {Object.values(stats.users).map(user => (
                  <div className={`clan-table-cell clan-level-${user.level}`} key={user.user_id}>
                    <IonAvatar>
                      <IonImg
                        src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                          user.user_id
                        ).toString(36)}.png`}
                      />
                    </IonAvatar>
                    <div>{user.username}</div>
                  </div>
                ))}
                <div className={`clan-table-cell clan-level-${stats.level}`}>
                  <div>Group Total</div>
                </div>
              </div>
              {reqs.all.map(req => (
                <div className="clan-table-column">
                  <div className="clan-table-cell clan-table-cell-header">
                    <IonImg
                      className="clan-table-req-img"
                      src={`https://server.cuppazee.app/requirements/${req}.png`}
                    />
                    <div>{requirementMeta[req]?.top}</div>
                    <div>{requirementMeta[req]?.bottom}</div>
                  </div>
                  {Object.values(stats.users).map(user => (
                    <div
                      className={`clan-table-cell clan-table-cell-data clan-level-${user.requirements[req]?.level}`}
                      key={user.user_id}>
                      {user.requirements[req]?.value?.toLocaleString() ?? 0}
                    </div>
                  ))}
                  <div
                    className={`clan-table-cell clan-table-cell-data clan-level-${stats.requirements[req]?.level}`}>
                    {stats.requirements[req]?.value?.toLocaleString() ?? 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </IonCard>
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default ClanStatsPage;
