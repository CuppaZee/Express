import {
  IonAvatar,
  IonCard,
  IonImg,
  IonItem,
  IonLabel,
  IonNote,
} from "@ionic/react";

import React, { useMemo } from "react";
import useMunzeeData from "../../utils/useMunzeeData";
import { GameID, generateClanRequirements, requirementMeta } from "@cuppazee/utils";
import "./Clan.css";
import dayjs from "dayjs";

export interface ClanRequirementProps {
  clan_id?: number;
  game_id: GameID;
}

const ClanRequirementsCard: React.FC<ClanRequirementProps> = ({ clan_id, game_id }) => {
  const requirements = useMunzeeData({
    endpoint: "clan/v2/requirements",
    params: { clan_id: clan_id ?? 1349, game_id: game_id.game_id },
  });

  const reqs = useMemo(
    () => (requirements.data ? generateClanRequirements(requirements.data?.data) : null),
    [requirements.dataUpdatedAt]
  );

  return (
    <IonCard>
      <IonItem className="clan-table-header" lines="none">
        <IonAvatar slot="start">
          <IonImg
            src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
              clan_id
            ).toString(36)}.png`}
          />
        </IonAvatar>
        <div>
          <IonLabel>Clan Requirements</IonLabel>
          <IonNote>{dayjs(game_id.date).format("MMM YYYY")}</IonNote>
        </div>
      </IonItem>
      {reqs && (
        <div role="table" className="clan-table clan-table-requirements clan-table-edg">
          <div role="row" className="clan-table-column">
            <div role="cell" className="clan-table-cell clan-table-cell-header">
              <div>Levels</div>
            </div>
            {[1, 2, 3, 4, 5].map(level => (
              <div role="cell" className={`clan-table-cell clan-level-${level}`} key={level}>
                <div>Level {level} Indiv</div>
              </div>
            ))}
            {[1, 2, 3, 4, 5].map(level => (
              <div role="cell" className={`clan-table-cell clan-level-${level}`} key={level}>
                <div>Level {level} Group</div>
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
