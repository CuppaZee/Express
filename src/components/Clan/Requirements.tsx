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
import { GameID, generateClanRequirements } from "@cuppazee/utils";
import "./Clan.css";
import dayjs from "dayjs";
import { UseQueryResult } from "react-query";
import { useTranslation } from "react-i18next";
import { ScrollSyncController, useScrollSync } from "../../utils/useScrollSync";
import useDB from "../../utils/useDB";
import useError, { CZError } from "../CZError";

export interface ClanRequirementProps {
  scrollSyncController?: MutableRefObject<ScrollSyncController>;
  clan_id?: number;
  game_id: GameID;
  hasLink?: boolean;
  queriesRef?: MutableRefObject<Set<UseQueryResult>>;
}

const ClanRequirementsCard: React.FC<ClanRequirementProps> = ({ clan_id, game_id, queriesRef, hasLink, scrollSyncController }) => {
  const { t } = useTranslation();
  const requirements = useMunzeeData({
    endpoint: "clan/v2/requirements",
    params: { clan_id: clan_id ?? 1349, game_id: game_id.game_id },
  });

  var db = useDB();

  const reqs = useMemo(
    () => (requirements.data ? generateClanRequirements(db, requirements.data?.data) : null),
    [requirements.dataUpdatedAt, db]
  );

  const levelCount = Object.keys(requirements.data?.data?.data.levels ?? {}).length;
  const levels = new Array(levelCount).fill(0).map((_, n) => n + 1);
  
  const [ref, onScroll] = useScrollSync<HTMLTableElement>(scrollSyncController);

  useEffect(() => {
    queriesRef?.current.add(requirements);
    return () => {
      queriesRef?.current.delete(requirements);
    };
  }, [requirements]);

  const error = useError([requirements]);

  return (
    <IonCard>
      <IonItem
        routerLink={
          hasLink
            ? game_id.game_id === new GameID().game_id
              ? "/clans/requirements"
              : `/clans/requirements/${game_id.month + 1}/${game_id.year}`
            : undefined
        }
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
      {error ? <CZError {...error} /> : <>
        {reqs && (
          <div
            ref={ref}
            onScroll={onScroll}
            role="table"
            className="clan-table clan-table-requirements clan-table-edg">
            <div role="row" className="clan-table-column">
              <div role="cell" className="clan-table-cell clan-table-cell-header">
                <div>{t("clan:levels")}</div>
              </div>
              {levels.map(level => (
                <div role="cell" className={`clan-table-cell clan-level-${level}`} key={level}>
                  <div>{t("clan:indiv_level", { level })}</div>
                </div>
              ))}
              {levels.map(level => (
                <div
                  data-section={level === 1 ? "group" : ""}
                  role="cell"
                  className={`clan-table-cell clan-level-${level}`}
                  key={level}>
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
                  <div>{db.getClanRequirement(req).top}</div>
                  <div>{db.getClanRequirement(req).bottom}</div>
                </div>
                {levels.map(level => (
                  <div
                    className={`clan-table-cell clan-table-cell-data clan-level-${reqs.tasks.individual[req]?.[level] ? level : "null"
                      }`}
                    key={level}>
                    {reqs.tasks.individual[req]?.[level]?.toLocaleString() ?? "-"}
                  </div>
                ))}
                {levels.map(level => (
                  <div
                    data-section={level === 1 ? "group" : ""}
                    className={`clan-table-cell clan-table-cell-data clan-level-${reqs.tasks.group[req]?.[level] ? level : "null"
                      }`}
                    key={level}>
                    {reqs.tasks.group[req]?.[level]?.toLocaleString() ?? "-"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </>}
    </IonCard>
  );
};

export default ClanRequirementsCard;
