import { IonAvatar, IonCard, IonImg, IonItem, IonLabel, IonNote } from "@ionic/react";

import React, { MutableRefObject, useEffect } from "react";
import {
  ClanRewardsData,
  GameID,
} from "@cuppazee/utils";
import "./Clan.css";
import dayjs from "dayjs";
import { UseQueryResult } from "react-query";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import { CZTypeImg } from "../CZImg";
import { useTranslation } from "react-i18next";
import useError, { CZError } from "../CZError";

export interface ClanRewardsProps {
  clan_id?: number;
  game_id: GameID;
  hasLink?: boolean;
  queriesRef?: MutableRefObject<Set<UseQueryResult>>;
}

function getTitle(name: string) {
  const title = name.split(" ");
  let ts: [string, string?] = [title.slice(0, -1).join(" "), title[title.length - 1]];
  if (title.length === 1) {
    ts = [title.join(" ")];
  } else if (title[1] === "Hammer") {
    ts = ["Hammer"];
  } else if (title[1] === "Axe") {
    ts = ["Battle Axe"];
  } else if (title.includes("Virtual") && title.includes("Color")) {
    ts = [title.filter(i => i !== "Virtual").join(" "), "Credit"];
  } else if (title.includes("Virtual")) {
    ts = [title.filter(i => i !== "Virtual").join(" "), "Virtual"];
  } else if (title.includes("Flat")) {
    ts = [title.filter(i => i !== "Flat").join(" "), "Flat"];
  }
  return ts;
}

const ClanRewardsCard: React.FC<ClanRewardsProps> = ({ game_id, queriesRef, hasLink }) => {
  const { t } = useTranslation();
  const rewards = useCuppaZeeData<{ data: ClanRewardsData }>({
    endpoint: "clan/rewards",
    params: { game_id: game_id.game_id },
  });

  const rew = rewards.data?.data;

  const levelCount = rew?.levels.length ?? 0;
  const levels = new Array(levelCount).fill(0).map((_, n) => n + 1);

  useEffect(() => {
    queriesRef?.current.add(rewards);
    return () => {
      queriesRef?.current.delete(rewards);
    };
  }, [rewards]);

  const error = useError([rewards]);

  return (
    <IonCard>
      <IonItem
        routerLink={hasLink ? "/clans/requirements" : undefined}
        detail={hasLink}
        className="clan-table-header"
        lines="none">
        <IonAvatar slot="start">
          <IonImg src={`https://munzee.global.ssl.fastly.net/images/clan_logos/0.png`} />
        </IonAvatar>
        <div>
          <IonLabel>{t("clan:clan_rewards")}</IonLabel>
          <IonNote>{dayjs(game_id.date).format("MMM YYYY")}</IonNote>
        </div>
      </IonItem>
      {error ? <CZError {...error} /> : <>
        {rew && (
          <div role="table" className="clan-table clan-table-rewards clan-table-edg">
            <div role="row" className="clan-table-column">
              <div role="cell" className="clan-table-cell clan-table-cell-header">
                <div>Levels</div>
              </div>
              {levels.map(level => (
                <div role="cell" className={`clan-table-cell clan-level-${level}`} key={level}>
                  <div>{t("clan:level", { level })}</div>
                </div>
              ))}
            </div>
            {rew.order.map(r => {
              const title = getTitle(rew.rewards[r]?.name ?? "");
              return (
                <div key={r} className="clan-table-column">
                  <div className="clan-table-cell clan-table-cell-header">
                    <CZTypeImg className="clan-table-req-img" img={rew.rewards[r]?.logo} />
                    <div>{title[0]}</div>
                    <div>{title[1] || <>&nbsp;</>}</div>
                  </div>
                  {rew.levels.map((level, levelIndex) => (
                    <div
                      className={`clan-table-cell clan-table-cell-data clan-level-${level[r] ? levelIndex + 1 : "null"
                        }`}
                      key={levelIndex}>
                      {level[r]?.toLocaleString() ?? "-"}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </>}
    </IonCard>
  );
};

export default ClanRewardsCard;
