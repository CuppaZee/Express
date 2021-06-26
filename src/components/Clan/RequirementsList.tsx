import {
  IonAvatar,
  IonCard,
  IonImg,
  IonItem,
  IonLabel,
  IonNote,
  IonCardContent,
  IonIcon,
} from "@ionic/react";

import React, { MutableRefObject, useEffect, useMemo } from "react";
import useMunzeeData from "../../utils/useMunzeeData";
import { ClanRewardsData, GameID, generateClanRequirements } from "@cuppazee/utils";
import "./Clan.css";
import dayjs from "dayjs";
import { UseQueryResult } from "react-query";
import { gift, people, person } from "ionicons/icons";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import { CZTypeImg } from "../CZImg";
import { useTranslation } from "react-i18next";
import useDB from "../../utils/useDB";

export interface ClanRequirementListProps {
  clan_id?: number;
  game_id: GameID;
  queriesRef?: MutableRefObject<Set<UseQueryResult>>;
}

const ClanRequirementsList: React.FC<ClanRequirementListProps> = ({
  clan_id,
  game_id,
  queriesRef,
}) => {
  const { t } = useTranslation();
  const requirements = useMunzeeData({
    endpoint: "clan/v2/requirements",
    params: { clan_id: clan_id ?? 1349, game_id: game_id.game_id },
  });

  const rewards = useCuppaZeeData<{ data: ClanRewardsData }>({
    endpoint: "clan/rewards",
    params: {game_id: game_id.game_id }
  })

  const db = useDB();

  const reqs = useMemo(
    () => (requirements.data ? generateClanRequirements(db, requirements.data?.data) : null),
    [requirements.dataUpdatedAt, db]
  );

  useEffect(() => {
    queriesRef?.current.add(requirements);
    return () => {
      queriesRef?.current.delete(requirements);
    };
  }, [requirements]);

  return (
    <IonCard>
      <IonItem className="clan-table-header" lines="none">
        <IonAvatar slot="start">
          <IonImg
            src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(clan_id).toString(
              36
            )}.png`}
          />
        </IonAvatar>
        <div>
          <IonLabel>{t("clan:clan_requirements")}</IonLabel>
          <IonNote>{dayjs(game_id.date).format("MMM YYYY")}</IonNote>
        </div>
      </IonItem>
      {reqs && (
        <IonCardContent className="clan-requirements-list-content">
          {[1, 2, 3, 4, 5].map(level => (
            <div>
              <h3>{t("clan:level", {level})}</h3>
              <h4>
                <IonIcon icon={person} /> {t("clan:individual")}
              </h4>
              {reqs.individual
                .filter(i => reqs.tasks.individual[i][level])
                .map(i => (
                  <IonItem lines="none" className="clan-requirements-list-item">
                    <IonImg
                      slot="start"
                      className="item-avatar"
                      src={`https://server.cuppazee.app/requirements/${i}.png`}
                    />
                    <IonLabel>
                      <b>{reqs.tasks.individual[i][level]?.toLocaleString()}</b>{" "}
                      {db.getClanRequirement(i).top} {db.getClanRequirement(i).bottom}
                    </IonLabel>
                  </IonItem>
                ))}
              <h4>
                <IonIcon icon={people} /> {t("clan:group")}
              </h4>
              {reqs.group
                .filter(i => reqs.tasks.group[i][level])
                .map(i => (
                  <IonItem lines="none" className="clan-requirements-list-item">
                    <IonImg
                      slot="start"
                      className="item-avatar"
                      src={`https://server.cuppazee.app/requirements/${i}.png`}
                    />
                    <IonLabel>
                      <b>{reqs.tasks.group[i][level]?.toLocaleString()}</b>{" "}
                      {db.getClanRequirement(i).top} {db.getClanRequirement(i).bottom}
                    </IonLabel>
                  </IonItem>
                ))}
              {rewards.data?.data && (
                <>
                  <h4>
                    <IonIcon icon={gift} /> {t("clan:rewards")}
                  </h4>
                  {Object.entries(rewards.data.data?.levels[level] ?? {}).map(([rew, count]) => (
                    <IonItem lines="none" className="clan-requirements-list-item">
                      <CZTypeImg
                        slot="start"
                        className="item-avatar"
                        img={rewards.data.data?.rewards[rew]?.logo}
                      />
                      <IonLabel>
                        <b>{count?.toLocaleString()}x</b> {rewards.data.data?.rewards[rew]?.name}
                      </IonLabel>
                    </IonItem>
                  ))}
                </>
              )}
            </div>
          ))}
        </IonCardContent>
      )}
    </IonCard>
  );
};

export default ClanRequirementsList;
