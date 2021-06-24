import {
  IonContent,
  IonPage,
} from "@ionic/react";
import Header from "../../components/Header";

import React, { useState } from "react";
import Tabs from "../../components/Tabs";
import useMunzeeData from "../../utils/useMunzeeData";
import {
  GameID,
} from "@cuppazee/utils";
import { RouteChildrenProps } from "react-router-dom";
import ClanStatsCard from "../../components/Clan/Stats";
import ClanRequirementsCard from "../../components/Clan/Requirements";
import { useScrollSyncController } from "../../utils/useScrollSync";

const ClanStatsPage: React.FC<RouteChildrenProps<{ id: string }>> = ({
  match,
}) => {
  const params = match?.params;
  const [sort, setSort] = useState(3);
  const clan = useMunzeeData({
    endpoint: "clan/v2",
    params: { clan_id: Number(params?.id) },
  });

  const scrollSyncController = useScrollSyncController();

  return (
    <IonPage>
      <Header title={clan.data?.data?.details.name ?? params?.id} />
      <IonContent fullscreen>
        {params && (
          <ClanStatsCard
            scrollSyncController={scrollSyncController}
            clan_id={Number(params?.id)}
            game_id={new GameID()}
            sort={sort}
            setSort={setSort}
          />
        )}
        {params && (
          <ClanRequirementsCard
            scrollSyncController={scrollSyncController}
            hasLink
            clan_id={Number(params?.id)}
            game_id={new GameID()}
          />
        )}
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default ClanStatsPage;
