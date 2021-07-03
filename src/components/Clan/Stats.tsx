import {
  IonAvatar,
  IonButton,
  IonCard,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonNote,
  IonPopover,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import React, { MutableRefObject, useEffect, useMemo } from "react";
import useMunzeeData from "../../utils/useMunzeeData";
import {
  ClanShadowData,
  ClanStatsData,
  ClanStatsUser,
  GameID,
  generateClanRequirements,
  generateClanStats,
} from "@cuppazee/utils";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import "./Clan.css";
import useStorage from "../../utils/useStorage";
import { ClanSettings, ClansSettingsStorage } from "../../storage/ClansSettings";
import { cafe, chevronDown, chevronUp, hammer } from "ionicons/icons";
import { Link } from "react-router-dom";
import { UseQueryResult } from "react-query";
import useWindowSize from "../../utils/useWindowSize";
import usePopover from "../../utils/usePopover";
import { useTranslation } from "react-i18next";
import { ScrollSyncController, useScrollSync } from "../../utils/useScrollSync";
import useDB from "../../utils/useDB";

export interface ClanStatsProps {
  scrollSyncController?: MutableRefObject<ScrollSyncController>;
  clan_id: number;
  game_id: GameID;
  sort: number;
  setSort(sort: number): void;
  queriesRef?: MutableRefObject<Set<UseQueryResult>>;
}

const ClanStatsCard: React.FC<ClanStatsProps> = ({
  clan_id,
  game_id,
  sort,
  setSort,
  queriesRef,
  scrollSyncController,
}) => {
  const { t } = useTranslation();
  const [clansSettings, setClansSettings] = useStorage(ClansSettingsStorage);
  const clanSettings: ClanSettings = (clansSettings[clan_id] = {
    goal: 5,
    hideShadow: false,
    subtract: false,
    share: false,
    ...(clansSettings[clan_id] ?? {}),
  });
  const clan = useMunzeeData({
    endpoint: "clan/v2",
    params: { clan_id: clan_id },
  });
  const requirements = useMunzeeData({
    endpoint: "clan/v2/requirements",
    params: { clan_id, game_id: game_id.game_id },
  });
  const shadow = useCuppaZeeData<{ data: ClanShadowData }>({
    endpoint: "clan/shadow/v1",
    params: { clan_id, game_id: game_id.game_id },
  });

  const db = useDB();

  const reqs = useMemo(
    () => (requirements.data ? generateClanRequirements(db, requirements.data?.data) : null),
    [requirements.dataUpdatedAt, db]
  );

  const levelCount = Object.keys(requirements.data?.data?.data.levels ?? {}).length;
  const levels = new Array(levelCount).fill(0).map((_, n) => n + 1);

  const stats = useMemo(
    () =>
      clan.data && reqs
        ? generateClanStats(
            db,
            clan.data?.data,
            requirements.data?.data,
            reqs,
            clan_id,
            clanSettings.hideShadow || (shadow.data?.data.members.length ?? 0) === 0
              ? undefined
              : shadow.data?.data
          )
        : null,
    [
      clan.dataUpdatedAt,
      requirements.dataUpdatedAt,
      reqs,
      shadow.dataUpdatedAt,
      clanSettings.hideShadow,
      db,
    ]
  );

  const windowSize = useWindowSize();

  const [popoverState, show] = usePopover();

  const [ref, onScroll] = useScrollSync<HTMLTableElement>(scrollSyncController);

  const goal = Math.max(0, Math.min(clanSettings.goal, levelCount));

  useEffect(() => {
    queriesRef?.current.add(clan);
    queriesRef?.current.add(requirements);
    queriesRef?.current.add(shadow);
    return () => {
      queriesRef?.current.delete(clan);
      queriesRef?.current.delete(requirements);
      queriesRef?.current.delete(shadow);
    };
  }, [clan, requirements, shadow]);

  function levelClass(u: ClanStatsUser | ClanStatsData, r: number) {
    if (typeof u.requirements[r]?.value !== "number" || Number.isNaN(u.requirements[r]?.value)) {
      return "clan-level-n";
    }
    const level = u.requirements[r]?.level;
    if (clanSettings.subtract) {
      return `clan-level-${
        typeof level === "number" && level > -1 && !Number.isNaN(level)
          ? (level ?? 0) >= goal
            ? goal
            : 0
          : "n"
      }`;
    }
    return `clan-level-${
      typeof level === "number" && level > -1 && !Number.isNaN(level) ? level : "n"
    }`;
  }

  function formatReqValue(u: ClanStatsUser | ClanStatsData, r: number) {
    const v = u.requirements[r]?.value;
    if (clanSettings.subtract) {
      const req = reqs?.tasks["user_id" in u ? "individual" : "group"][r]?.[goal];
      if (!req) {
        return "-";
      }
      return v || v === 0 ? (req - v > 0 ? (req - v).toLocaleString() : "-") : "⛔";
    }
    return v ? v.toLocaleString() : Number.isNaN(v) ? "⛔" : "-";
  }

  const users = Object.entries(stats?.users ?? {})
    .sort(
      (a, b) =>
        ((sort > 0 ? b : a)[1].requirements[Math.abs(sort)]?.value ?? 0) -
        ((sort > 0 ? a : b)[1].requirements[Math.abs(sort)]?.value ?? 0)
    )
    .map(i => i[1]);

  return (
    <IonCard>
      <IonItem button={false} className="clan-table-header" lines="none">
        <IonAvatar slot="start">
          <IonImg
            src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(clan_id).toString(
              36
            )}.png`}
          />
        </IonAvatar>
        <div>
          <IonLabel>{clan.data?.data?.details.name}</IonLabel>
          <IonNote>{clan.data?.data?.details.tagline}</IonNote>
        </div>
        <div className="clan-control-row" slot="end">
          {windowSize.width >= 800 && (
            <>
              <div>
                <IonSegment
                  value={clanSettings.subtract ? "1" : "0"}
                  onIonChange={ev => {
                    setClansSettings({
                      ...clansSettings,
                      [clan_id ?? "0"]: { ...clanSettings, subtract: ev.detail.value === "1" },
                    });
                  }}>
                  <IonSegmentButton value="0">{t("clan:mode_achieved")}</IonSegmentButton>
                  <IonSegmentButton value="1">{t("clan:mode_remaining")}</IonSegmentButton>
                </IonSegment>
              </div>
              <div>
                <IonPopover {...popoverState}>
                  <IonSegment
                    value={clanSettings.share ? "1" : "0"}
                    onIonChange={ev => {
                      setClansSettings({
                        ...clansSettings,
                        [clan_id ?? "0"]: { ...clanSettings, share: ev.detail.value === "1" },
                      });
                    }}>
                    <IonSegmentButton value="0">{t("clan:individual")}</IonSegmentButton>
                    <IonSegmentButton value="1">Share</IonSegmentButton>
                  </IonSegment>
                  {levels.map(i => (
                    <IonItem
                      style={{
                        borderLeft: `4px solid var(--clan-level-${i})`,
                        color: `var(--clan-level-${i})`,
                      }}
                      onClick={() => {
                        setClansSettings({
                          ...clansSettings,
                          [clan_id ?? "0"]: {
                            ...clanSettings,
                            goal: i,
                          },
                        });
                        popoverState.onDidDismiss();
                      }}>
                      <IonLabel>{t("clan:level", { level: i })}</IonLabel>
                    </IonItem>
                  ))}
                </IonPopover>
                <IonButton onClick={show}>
                  {t("clan:level", { level: goal })}{" "}
                  <IonIcon style={{ fontSize: "1em" }} icon={chevronDown} />
                </IonButton>
              </div>
            </>
          )}
          {(shadow.data?.data.members.length ?? 0) > 0 && (
            <IonButton
              onClick={() => {
                setClansSettings({
                  ...clansSettings,
                  [clan_id ?? "0"]: {
                    ...clanSettings,
                    hideShadow: !clanSettings.hideShadow,
                  },
                });
              }}>
              <IonIcon icon={cafe} />
            </IonButton>
          )}
        </div>
      </IonItem>
      {windowSize.width < 800 && (
        <div className="clan-control-row">
          <div>
            <IonSegment
              value={clanSettings.subtract ? "1" : "0"}
              onIonChange={ev => {
                setClansSettings({
                  ...clansSettings,
                  [clan_id ?? "0"]: { ...clanSettings, subtract: ev.detail.value === "1" },
                });
              }}>
              <IonSegmentButton value="0">{t("clan:mode_achieved")}</IonSegmentButton>
              <IonSegmentButton value="1">{t("clan:mode_remaining")}</IonSegmentButton>
            </IonSegment>
          </div>
          <div>
            <IonPopover {...popoverState}>
              <IonSegment
                value={clanSettings.share ? "1" : "0"}
                onIonChange={ev => {
                  setClansSettings({
                    ...clansSettings,
                    [clan_id ?? "0"]: { ...clanSettings, share: ev.detail.value === "1" },
                  });
                }}>
                <IonSegmentButton value="0">{t("clan:individual")}</IonSegmentButton>
                <IonSegmentButton value="1">Share</IonSegmentButton>
              </IonSegment>
              {levels.map(i => (
                <IonItem
                  style={{
                    borderLeft: `4px solid var(--clan-level-${i})`,
                    color: `var(--clan-level-${i})`,
                  }}
                  onClick={() => {
                    setClansSettings({
                      ...clansSettings,
                      [clan_id ?? "0"]: {
                        ...clanSettings,
                        goal: i,
                      },
                    });
                    popoverState.onDidDismiss();
                  }}>
                  <IonLabel>{t("clan:level", { level: i })}</IonLabel>
                </IonItem>
              ))}
            </IonPopover>
            <IonButton size="small" onClick={show}>
              {t("clan:level", { level: goal })}{" "}
              <IonIcon style={{ fontSize: "1em" }} icon={chevronDown} />
            </IonButton>
          </div>
        </div>
      )}
      {stats && reqs && (
        <div
          ref={ref}
          onScroll={onScroll}
          role="table"
          className="clan-table clan-table-stats clan-table-edg">
          <div role="row" className="clan-table-column">
            <div role="cell" className="clan-table-cell clan-table-cell-header">
              <div>
                {Object.values(stats.users).length} {t("pages:players")}
              </div>
              <div>{t("clan:rank", { rank: clan.data?.data?.result?.rank })}</div>
            </div>
            <div role="cell" className={`clan-table-cell clan-level-${goal}`}>
              <IonSelect
                onIonChange={ev => {
                  setClansSettings({
                    ...clansSettings,
                    [clan_id ?? "0"]: {
                      ...clanSettings,
                      goal: Number(ev.detail.value),
                    },
                  });
                }}
                value={goal}>
                {levels.map(i => (
                  <IonSelectOption value={i}>
                    {t(clanSettings.share ? "clan:share_level" : "clan:indiv_level", { level: i })}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
            {users.map(user => (
              <Link
                to={`/player/${user.username}`}
                role="cell"
                className={`clan-table-cell clan-level-${user.level}`}
                key={user.user_id}>
                <IonAvatar>
                  <IonImg
                    src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                      user.user_id
                    ).toString(36)}.png`}
                  />
                </IonAvatar>
                <div>
                  {user.admin && <IonIcon icon={hammer} />}
                  {user.shadow && <IonIcon icon={cafe} />}
                  {user.username}
                </div>
              </Link>
            ))}
            <div className={`clan-table-cell clan-level-${stats.level}`}>
              <div>{t("clan:group_total")}</div>
            </div>
            <div className={`clan-table-cell clan-level-${goal}`}>
              <IonSelect
                onIonChange={ev => {
                  setClansSettings({
                    ...clansSettings,
                    [clan_id ?? "0"]: {
                      ...clanSettings,
                      goal: Number(ev.detail.value),
                    },
                  });
                }}
                value={goal}>
                {levels.map(i => (
                  <IonSelectOption value={i}>{t("clan:group_level", { level: i })}</IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>
          {reqs.all.map(req => (
            <div className="clan-table-column">
              <div
                onClick={() => {
                  setSort(Math.abs(sort) === req ? -sort : req);
                }}
                className="clan-table-cell clan-table-cell-header">
                <IonImg
                  className="clan-table-req-img"
                  src={`https://server.cuppazee.app/requirements/${req}.png`}
                />
                <div>
                  {db.getClanRequirement(req).top}
                  {Math.abs(sort) === req && (
                    <IonIcon icon={sort === req ? chevronDown : chevronUp} />
                  )}
                </div>
                <div>{db.getClanRequirement(req).bottom}</div>
              </div>
              <div
                className={`clan-table-cell clan-table-cell-data clan-level-${
                  reqs.tasks.individual[req]?.[goal] ||
                  (clanSettings.share &&
                    reqs.tasks.group[req]?.[goal])
                    ? goal
                    : "null"
                }`}
                key="indiv">
                {(clanSettings.share
                  ?
                    (Math.max(
                      reqs.tasks.individual[req]?.[goal] ?? 0,
                      Math.ceil((reqs.tasks.group[req]?.[goal] ?? 0) / users.length) ?? 0
                    ) || "-").toLocaleString()
                  : reqs.tasks.individual[req]?.[goal]?.toLocaleString()) || "-"}
              </div>
              {users.map(user => (
                <div
                  className={`clan-table-cell clan-table-cell-data ${levelClass(user, req)}`}
                  key={user.user_id}>
                  {formatReqValue(user, req)}
                </div>
              ))}
              <div className={`clan-table-cell clan-table-cell-data ${levelClass(stats, req)}`}>
                {formatReqValue(stats, req)}
              </div>
              <div
                className={`clan-table-cell clan-table-cell-data clan-level-${
                  reqs.tasks.group[req]?.[goal] ? goal : "null"
                }`}
                key="group">
                {reqs.tasks.group[req]?.[goal]?.toLocaleString() ?? "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </IonCard>
  );
};

export default ClanStatsCard;
