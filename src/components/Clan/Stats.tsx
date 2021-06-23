import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonPopover,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSelectPopover,
} from "@ionic/react";
import Header from "../../components/Header";

import React, { MutableRefObject, useEffect, useMemo, useState } from "react";
import Tabs from "../../components/Tabs";
import useMunzeeData from "../../utils/useMunzeeData";
import {
  ClanShadowData,
  ClanStatsData,
  ClanStatsUser,
  GameID,
  generateClanRequirements,
  generateClanStats,
  requirementMeta,
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

export interface ClanStatsProps {
  clan_id: number;
  game_id: GameID;
  sort: number;
  setSort(sort: number): void;
  queriesRef?: MutableRefObject<Set<UseQueryResult>>;
}

const ClanStatsCard: React.FC<ClanStatsProps> = ({ clan_id, game_id, sort, setSort, queriesRef }) => {
  const { t } = useTranslation();
  const [clansSettings, setClansSettings] = useStorage(ClansSettingsStorage);
  const clanSettings: ClanSettings = (clansSettings[clan_id] = {
    goal: 5,
    hideShadow: false,
    subtract: false,
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

  const reqs = useMemo(
    () => (requirements.data ? generateClanRequirements(requirements.data?.data) : null),
    [requirements.dataUpdatedAt]
  );

  const stats = useMemo(
    () =>
      clan.data && reqs
        ? generateClanStats(
            clan.data?.data,
            requirements.data?.data,
            reqs,
            clan_id,
            shadow.data?.data
          )
        : null,
    [clan.dataUpdatedAt, requirements.dataUpdatedAt, reqs, shadow.dataUpdatedAt]
  );

  const windowSize = useWindowSize();

  const [popoverState, show] = usePopover();

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
          ? (level ?? 0) >= clanSettings.goal
            ? clanSettings.goal
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
      const req = reqs?.tasks["user_id" in u ? "individual" : "group"][r]?.[clanSettings.goal];
      if (!req) {
        return "-";
      }
      return v ? (req - v > 0 ? (req - v).toLocaleString() : "-") : "⛔";
    }
    return v ? v.toLocaleString() : Number.isNaN(v) ? "⛔" : "-";
  }

  const users = Object.entries(stats?.users ?? {})
    .sort(
      (a, b) =>
        ((sort > 0 ? b : a)[1].requirements[Math.abs(sort)]?.value ?? 0) -
        ((sort > 0 ? a : b)[1].requirements[Math.abs(sort)]?.value ?? 0)
    )
    .map(i => i[1])
    .filter(i => !(clanSettings.hideShadow && i.shadow));

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
                  {[1, 2, 3, 4, 5].map(i => (
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
                            goal: Math.min(5, Math.max(0, i)),
                          },
                        });
                        popoverState.onDidDismiss();
                      }}>
                      <IonLabel>{t("clan:level", { level: i })}</IonLabel>
                    </IonItem>
                  ))}
                </IonPopover>
                <IonButton onClick={show}>
                  {t("clan:level", { level: clanSettings.goal })}{" "}
                  <IonIcon style={{ fontSize: "1em" }} icon={chevronDown} />
                </IonButton>
              </div>
            </>
          )}
          {shadow.data && (
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
              {[1, 2, 3, 4, 5].map(i => (
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
                        goal: Math.min(5, Math.max(0, i)),
                      },
                    });
                    popoverState.onDidDismiss();
                  }}>
                  <IonLabel>{t("clan:level", { level: i })}</IonLabel>
                </IonItem>
              ))}
            </IonPopover>
            <IonButton size="small" onClick={show}>
              {t("clan:level", { level: clanSettings.goal })}{" "}
              <IonIcon style={{ fontSize: "1em" }} icon={chevronDown} />
            </IonButton>
          </div>
        </div>
      )}
      {stats && reqs && (
        <div role="table" className="clan-table clan-table-stats clan-table-edg">
          <div role="row" className="clan-table-column">
            <div role="cell" className="clan-table-cell clan-table-cell-header">
              <div>{Object.values(stats.users).length} {t("pages:players")}</div>
              <div>{t("clan:rank", { rank: clan.data?.data?.result?.rank })}</div>
            </div>
            <div role="cell" className={`clan-table-cell clan-level-${clanSettings.goal}`}>
              <IonSelect
                onIonChange={ev => {
                  setClansSettings({
                    ...clansSettings,
                    [clan_id ?? "0"]: {
                      ...clanSettings,
                      goal: Math.min(5, Math.max(0, Number(ev.detail.value))),
                    },
                  });
                }}
                value={clanSettings.goal}>
                <IonSelectOption value={1}>{t("clan:indiv_level", { level: 1 })}</IonSelectOption>
                <IonSelectOption value={2}>{t("clan:indiv_level", { level: 2 })}</IonSelectOption>
                <IonSelectOption value={3}>{t("clan:indiv_level", { level: 3 })}</IonSelectOption>
                <IonSelectOption value={4}>{t("clan:indiv_level", { level: 4 })}</IonSelectOption>
                <IonSelectOption value={5}>{t("clan:indiv_level", { level: 5 })}</IonSelectOption>
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
            <div className={`clan-table-cell clan-level-${clanSettings.goal}`}>
              <IonSelect
                onIonChange={ev => {
                  setClansSettings({
                    ...clansSettings,
                    [clan_id ?? "0"]: {
                      ...clanSettings,
                      goal: Math.min(5, Math.max(0, Number(ev.detail.value))),
                    },
                  });
                }}
                value={clanSettings.goal}>
                <IonSelectOption value={1}>{t("clan:group_level", { level: 1 })}</IonSelectOption>
                <IonSelectOption value={2}>{t("clan:group_level", { level: 2 })}</IonSelectOption>
                <IonSelectOption value={3}>{t("clan:group_level", { level: 3 })}</IonSelectOption>
                <IonSelectOption value={4}>{t("clan:group_level", { level: 4 })}</IonSelectOption>
                <IonSelectOption value={5}>{t("clan:group_level", { level: 5 })}</IonSelectOption>
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
                  {requirementMeta[req]?.top}
                  {Math.abs(sort) === req && (
                    <IonIcon icon={sort === req ? chevronDown : chevronUp} />
                  )}
                </div>
                <div>{requirementMeta[req]?.bottom}</div>
              </div>
              <div
                className={`clan-table-cell clan-table-cell-data clan-level-${
                  reqs.tasks.individual[req]?.[clanSettings.goal] ? clanSettings.goal : "null"
                }`}
                key="indiv">
                {reqs.tasks.individual[req]?.[clanSettings.goal]?.toLocaleString() ?? "-"}
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
                  reqs.tasks.group[req]?.[clanSettings.goal] ? clanSettings.goal : "null"
                }`}
                key="group">
                {reqs.tasks.group[req]?.[clanSettings.goal]?.toLocaleString() ?? "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </IonCard>
  );
};

export default ClanStatsCard;
