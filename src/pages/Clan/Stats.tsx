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
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import Header from "../../components/Header";

import React, { useMemo, useState } from "react";
import Tabs from "../../components/Tabs";
import useCZParams from "../../utils/useCZParams";
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
import {
  add,
  addCircle,
  arrowUp,
  cafe,
  chevronDown,
  chevronUp,
  hammer,
  removeCircle,
  settings,
} from "ionicons/icons";
import { Link } from "react-router-dom";

const ClanStatsPage: React.FC = () => {
  const params = useCZParams<{ id: string }>("/clan/:id");
  const [clansSettings, setClansSettings] = useStorage(ClansSettingsStorage);
  const clanSettings: ClanSettings = (clansSettings[params?.id ?? "0"] = {
    goal: 5,
    hideShadow: false,
    subtract: false,
    ...(clansSettings[params?.id ?? "0"] ?? {}),
  });
  const [sort, setSort] = useState(3);
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
            Number(params?.id),
            shadow.data?.data
          )
        : null,
    [clan.dataUpdatedAt, requirements.dataUpdatedAt, reqs, shadow.dataUpdatedAt]
  );

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

  const users = Object.entries(stats?.users ?? {}).sort(
    (a, b) => ((sort > 0 ? b : a)[1].requirements[Math.abs(sort)]?.value ?? 0) - ((sort > 0 ? a : b)[1].requirements[Math.abs(sort)]?.value ?? 0)
  ).map(i=>i[1]).filter(i=>!(clanSettings.hideShadow && i.shadow));

  return (
    <IonPage>
      <Header title={`${clan.data?.data?.details.name ?? params?.id} - Stats`} />
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
            <IonButtons slot="end">
              <IonButton
                onClick={() => {
                  setClansSettings({
                    ...clansSettings,
                    [params?.id ?? "0"]: { ...clanSettings, subtract: !clanSettings.subtract },
                  });
                }}>
                <IonIcon icon={clanSettings.subtract ? removeCircle : addCircle} />
              </IonButton>
              <IonButton
                onClick={() => {
                  setClansSettings({
                    ...clansSettings,
                    [params?.id ?? "0"]: { ...clanSettings, hideShadow: !clanSettings.hideShadow },
                  });
                }}>
                <IonIcon icon={cafe} />
              </IonButton>
              {/* <IonButton>
                <IonIcon icon={settings} />
              </IonButton> */}
            </IonButtons>
          </IonItem>
          {stats && reqs && (
            <div role="table" className="clan-table clan-table-edg">
              <div role="row" className="clan-table-column">
                <div role="cell" className="clan-table-cell clan-table-cell-header">
                  <div>{Object.values(stats.users).length} Players</div>
                  <div>Rank #{clan.data?.data?.result?.rank}</div>
                </div>
                <div role="cell" className={`clan-table-cell clan-level-${clanSettings.goal}`}>
                  <IonSelect
                    onIonChange={ev => {
                      setClansSettings({
                        ...clansSettings,
                        [params?.id ?? "0"]: {
                          ...clanSettings,
                          goal: Math.min(5, Math.max(0, Number(ev.detail.value))),
                        },
                      });
                    }}
                    value={clanSettings.goal}>
                    <IonSelectOption value={1}>Level 1 Indiv</IonSelectOption>
                    <IonSelectOption value={2}>Level 2 Indiv</IonSelectOption>
                    <IonSelectOption value={3}>Level 3 Indiv</IonSelectOption>
                    <IonSelectOption value={4}>Level 4 Indiv</IonSelectOption>
                    <IonSelectOption value={5}>Level 5 Indiv</IonSelectOption>
                  </IonSelect>
                </div>
                {users.map(user => (
                  <Link
                    to={`/user/${user.username}`}
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
                  <div>Group Total</div>
                </div>
                <div className={`clan-table-cell clan-level-${clanSettings.goal}`}>
                  <IonSelect
                    onIonChange={ev => {
                      setClansSettings({
                        ...clansSettings,
                        [params?.id ?? "0"]: {
                          ...clanSettings,
                          goal: Math.min(5, Math.max(0, Number(ev.detail.value))),
                        },
                      });
                    }}
                    value={clanSettings.goal}>
                    <IonSelectOption value={1}>Level 1 Group</IonSelectOption>
                    <IonSelectOption value={2}>Level 2 Group</IonSelectOption>
                    <IonSelectOption value={3}>Level 3 Group</IonSelectOption>
                    <IonSelectOption value={4}>Level 4 Group</IonSelectOption>
                    <IonSelectOption value={5}>Level 5 Group</IonSelectOption>
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
                      reqs.tasks.individual[req]?.[clanSettings.goal - 1]
                        ? clanSettings.goal
                        : "null"
                    }`}
                    key="indiv">
                    {reqs.tasks.individual[req]?.[clanSettings.goal - 1]?.toLocaleString() ?? "-"}
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
                      reqs.tasks.group[req]?.[clanSettings.goal - 1] ? clanSettings.goal : "null"
                    }`}
                    key="group">
                    {reqs.tasks.group[req]?.[clanSettings.goal - 1]?.toLocaleString() ?? "-"}
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
