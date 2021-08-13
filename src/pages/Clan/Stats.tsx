import { IonContent, IonPage, IonButton, useIonPicker, useIonRouter, IonIcon } from "@ionic/react";
import Header from "../../components/Header";

import React, { useState } from "react";
import Tabs from "../../components/Tabs";
import useMunzeeData from "../../utils/useMunzeeData";
import { GameID } from "@cuppazee/utils";
import { RouteChildrenProps } from "react-router-dom";
import ClanStatsCard from "../../components/Clan/Stats";
import ClanRequirementsCard from "../../components/Clan/Requirements";
import { useScrollSyncController } from "../../utils/useScrollSync";
import dayjs from "dayjs";
import blankAnimation from "../../utils/blankAnimation";
import { chevronDown } from "ionicons/icons";

const ClanStatsPage: React.FC<RouteChildrenProps<{ id: string; month?: string; year?: string }>> =
  ({ match }) => {
    const params = match?.params;
    const [sort, setSort] = useState(3);
    const clan = useMunzeeData({
      endpoint: "clan/v2",
      params: { clan_id: Number(params?.id) },
    });
    const [present] = useIonPicker();

    const game_id = params?.year
      ? new GameID(Number(params.year), Number(params.month) - 1)
      : new GameID();

    const history = useIonRouter();

    const scrollSyncController = useScrollSyncController();

    return (
      <IonPage>
        <Header title={clan.data?.data?.details.name ?? params?.id} />
        <IonContent fullscreen>
          <IonButton
            size="small"
            className="clan-battle-selector"
            onClick={() => {
              present({
                buttons: [
                  {
                    text: "Cancel",
                  },
                  {
                    text: "Confirm",
                    handler: selected => {
                      const game_id: GameID = selected["Clan Battle"].value;
                      history.push(
                        game_id.game_id === new GameID().game_id
                          ? `/clan/${params?.id}`
                          : `/clan/${params?.id}/${game_id.month + 1}/${game_id.year}`,
                        undefined,
                        "replace",
                        undefined,
                        blankAnimation
                      );
                    },
                  },
                ],
                columns: [
                  {
                    name: "Clan Battle",
                    options: new Array(new GameID().game_id - 78)
                      .fill(0)
                      .map((_, n) => new GameID(79 + n))
                      .map(i => ({
                        text: `Battle ${i.game_id} - ${dayjs(i.date).format("MMMM YYYY")}`,
                        value: i,
                      }))
                      .reverse(),
                    selectedIndex: new GameID().game_id - game_id.game_id,
                  },
                ],
              });
            }}>
            {dayjs(game_id.date).format("MMMM YYYY")}
            <IonIcon icon={chevronDown} />
          </IonButton>
          {params && (
            <ClanStatsCard
              key={params?.id}
              scrollSyncController={scrollSyncController}
              clan_id={Number(params?.id)}
              game_id={game_id}
              sort={sort}
              setSort={setSort}
            />
          )}
          {params && (
            <ClanRequirementsCard
              scrollSyncController={scrollSyncController}
              hasLink
              clan_id={Number(params?.id)}
              game_id={game_id}
            />
          )}
        </IonContent>
        <Tabs />
      </IonPage>
    );
  };

export default ClanStatsPage;
