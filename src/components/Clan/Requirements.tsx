import {
  IonAvatar,
  IonCard,
  IonImg,
  IonItem,
  IonLabel,
  IonNote,
} from "@ionic/react";

import React, { MutableRefObject, useEffect, useMemo } from "react";
import useMunzeeData from "../../utils/useMunzeeData";
import { GameID, generateClanRequirements, requirementMeta } from "@cuppazee/utils";
import "./Clan.css";
import dayjs from "dayjs";
import { UseQueryResult } from "react-query";
import { useTranslation } from "react-i18next";

export interface ClanRequirementProps {
  clan_id?: number;
  game_id: GameID;
  hasLink?: boolean;
  queriesRef?: MutableRefObject<Set<UseQueryResult>>;
}

const ClanRequirementsCard: React.FC<ClanRequirementProps> = ({ clan_id, game_id, queriesRef, hasLink }) => {
  const { t } = useTranslation();
  const requirements = useMunzeeData({
    endpoint: "clan/v2/requirements",
    params: { clan_id: clan_id ?? 1349, game_id: game_id.game_id },
  });

  const reqs = useMemo(
    () => (requirements.data ? generateClanRequirements(requirements.data?.data) : null),
    [requirements.dataUpdatedAt]
  );
  

  useEffect(() => {
    queriesRef?.current.add(requirements);
    return () => {
      queriesRef?.current.delete(requirements);
    };
  }, [requirements]);

  return (
    <IonCard>
      <IonItem
        routerLink={hasLink ? "/clans/requirements" : undefined}
        detail={hasLink}
        className="clan-table-header"
        lines="none">
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
        <div role="table" className="clan-table clan-table-requirements clan-table-edg">
          <div role="row" className="clan-table-column">
            <div role="cell" className="clan-table-cell clan-table-cell-header">
              <div>{t("clan:levels")}</div>
            </div>
            {[1, 2, 3, 4, 5].map(level => (
              <div role="cell" className={`clan-table-cell clan-level-${level}`} key={level}>
                <div>{t("clan:indiv_level", { level })}</div>
              </div>
            ))}
            {[1, 2, 3, 4, 5].map(level => (
              <div role="cell" className={`clan-table-cell clan-level-${level}`} key={level}>
                <div>{t("clan:group_level", { level })}</div>
              </div>
            ))}
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
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  className={`clan-table-cell clan-table-cell-data clan-level-${
                    reqs.tasks.individual[req]?.[level] ? level : "null"
                  }`}
                  key={level}>
                  {reqs.tasks.individual[req]?.[level]?.toLocaleString() ?? "-"}
                </div>
              ))}
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  className={`clan-table-cell clan-table-cell-data clan-level-${
                    reqs.tasks.group[req]?.[level] ? level : "null"
                  }`}
                  key={level}>
                  {reqs.tasks.group[req]?.[level]?.toLocaleString() ?? "-"}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </IonCard>
  );
};

export default ClanRequirementsCard;
