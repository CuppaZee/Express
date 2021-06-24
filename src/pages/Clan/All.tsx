import { IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";

import React, { useRef, useState } from "react";
import Tabs from "../../components/Tabs";
import { GameID } from "@cuppazee/utils";
import ClanStatsCard from "../../components/Clan/Stats";
import ClanRequirementsCard from "../../components/Clan/Requirements";
import useUserSettings from "../../utils/useUserSettings";
import { UseQueryResult } from "react-query";
import CZRefresher from "../../components/CZRefresher";
import { useTranslation } from "react-i18next";
import { useScrollSyncController } from "../../utils/useScrollSync";

const ClanAllPage: React.FC = () => {
  const [sort, setSort] = useState(3);
  const { clans } = useUserSettings() ?? {};
  const queriesRef = useRef<Set<UseQueryResult>>(new Set());
  const { t } = useTranslation();

  const scrollSyncController = useScrollSyncController();

  return (
    <IonPage>
      <Header title={t("pages:clans")} />
      <IonContent fullscreen>
        <CZRefresher queries={queriesRef} />
        {clans && (
          <ClanRequirementsCard
            scrollSyncController={scrollSyncController}
            hasLink
            queriesRef={queriesRef}
            clan_id={clans[0]?.clan_id}
            game_id={new GameID()}
          />
        )}
        {clans?.map(i => (
          <ClanStatsCard
            scrollSyncController={scrollSyncController}
            queriesRef={queriesRef}
            clan_id={i.clan_id}
            game_id={new GameID()}
            sort={sort}
            setSort={setSort}
          />
        ))}
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default ClanAllPage;
