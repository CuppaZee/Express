import { IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";

import React, { useState } from "react";
import Tabs from "../../components/Tabs";
import { GameID } from "@cuppazee/utils";
import ClanStatsCard from "../../components/Clan/Stats";
import ClanRequirementsCard from "../../components/Clan/Requirements";
import useUserSettings from "../../utils/useUserSettings";

const ClanAllPage: React.FC = () => {
  const [sort, setSort] = useState(3);
  const { clans } = useUserSettings() ?? {};

  return (
    <IonPage>
      <Header title={`Clans`} />
      <IonContent fullscreen>
        {clans && <ClanRequirementsCard clan_id={clans[0]?.clan_id} game_id={new GameID()} />}
        {clans?.map(i => (
          <ClanStatsCard clan_id={i.clan_id} game_id={new GameID()} sort={sort} setSort={setSort} />
        ))}
        {/* <IonCard>
          <IonItem className="clan-table-header" lines="none">
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
            {shadow.data && (
              <IonButtons slot="end">
                {/* <IonButton
                onClick={() => {
                  setClansSettings({
                    ...clansSettings,
                    [params?.id ?? "0"]: { ...clanSettings, subtract: !clanSettings.subtract },
                  });
                }}>
                <IonIcon icon={clanSettings.subtract ? removeCircle : addCircle} />
              </IonButton> /}
                <IonButton
                  onClick={() => {
                    setClansSettings({
                      ...clansSettings,
                      [params?.id ?? "0"]: {
                        ...clanSettings,
                        hideShadow: !clanSettings.hideShadow,
                      },
                    });
                  }}>
                  <IonIcon icon={cafe} />
                </IonButton>
                {/* <IonButton>
                <IonIcon icon={settings} />
              </IonButton> /}
              </IonButtons>
            )}
          </IonItem>
          <div className="clan-control-row">
            <div>
              <IonSegment
                value={clanSettings.subtract ? "1" : "0"}
                onIonChange={ev => {
                  setClansSettings({
                    ...clansSettings,
                    [params?.id ?? "0"]: { ...clanSettings, subtract: ev.detail.value === "1" },
                  });
                }}>
                <IonSegmentButton value="0">Achieved</IonSegmentButton>
                <IonSegmentButton value="1">Remaining</IonSegmentButton>
              </IonSegment>
            </div>
            <div>
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
                <IonSelectOption value={1}>Level 1</IonSelectOption>
                <IonSelectOption value={2}>Level 2</IonSelectOption>
                <IonSelectOption value={3}>Level 3</IonSelectOption>
                <IonSelectOption value={4}>Level 4</IonSelectOption>
                <IonSelectOption value={5}>Level 5</IonSelectOption>
              </IonSelect>
            </div>
          </div>
          {stats && reqs && (
            <div role="table" className="clan-table clan-table-stats clan-table-edg">
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
        </IonCard> */}
        {/* <IonCard>
          <IonItem className="clan-table-header" lines="none">
            <IonAvatar slot="start">
              <IonImg
                src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                  params?.id
                ).toString(36)}.png`}
              />
            </IonAvatar>
            <div>
              <IonLabel>Clan Requirements</IonLabel>
              <IonNote>June 2021</IonNote>
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
        </IonCard> */}
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default ClanAllPage;
