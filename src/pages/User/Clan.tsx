import { IonCard, IonContent, IonItem, IonPage, IonLabel, IonImg, IonNote } from "@ionic/react";
import "./Clan.css";
import Header from "../../components/Header";

import React, { useMemo } from "react";
import useUserID from "../../utils/useUserID";
import CZRefresher from "../../components/CZRefresher";
import Tabs from "../../components/Tabs";
import useMunzeeData from "../../utils/useMunzeeData";
import { RouteChildrenProps } from "react-router";
import { useTranslation } from "react-i18next";
import { GameID, generateClanRequirements, requirementMeta } from "@cuppazee/utils/lib";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import ClanRequirementsCard from "../../components/Clan/Requirements";
import FancyGrid from "../../components/FancyGrid";
import { CZLoadText } from "../../components/CZLoad";

const UserClanProgressPage: React.FC<RouteChildrenProps<{ username: string }>> = ({ match }) => {
  const params = match?.params;
  const { t } = useTranslation();
  const userID = useUserID(params?.username);
  const requirements = useMunzeeData({
    endpoint: "clan/v2/requirements",
    params: { clan_id: 1349, game_id: new GameID().game_id },
  });

  const reqs = useMemo(
    () => (requirements.data ? generateClanRequirements(requirements.data?.data) : null),
    [requirements.dataUpdatedAt]
  );

  const data = useCuppaZeeData<{ data: { [key: string]: number } }>({
    endpoint: "user/clanprogress",
    params: { user_id: userID },
    options: { enabled: !!userID }
  });

  function getLevel(req: number) {
    const l = reqs?.tasks.individual[req]?.findIndex(i => i > (data.data?.data?.[req] ?? 0));
    if (l === null || l === undefined) {
      return null;
    }
    if (l < 0) {
      return 5;
    } else if (l === 0) {
      return l;
    } else {
      return l - 1;
    }
  }

  return (
    <IonPage>
      <Header title={`${params?.username} - ${t("pages:player_clan_progress")}`}></Header>

      <IonContent fullscreen>
        <CZRefresher queries={[data, requirements]} />
        <FancyGrid width={300} maxWidth={700}>
          {reqs?.all.map(req => (
            <IonCard key={`card_${req}`} className="clanprogress-card">
              <IonItem className={`user-clan-level-${getLevel(req)}`} lines="none">
                <IonImg
                  src={`https://server.cuppazee.app/requirements/${req}.png`}
                  slot="start"
                  className="item-avatar"
                />
                <div>
                  <IonLabel>
                    {requirementMeta[req]?.top} {requirementMeta[req]?.bottom}
                  </IonLabel>
                  {data.data?.data ? (
                    <IonLabel>{data.data?.data?.[req]?.toLocaleString() ?? 0}</IonLabel>
                  ) : (
                    <IonLabel>
                      <CZLoadText loading={true} />
                    </IonLabel>
                  )}
                </div>
                {getLevel(req) !== null && (
                  <div className="clanprogress-level" slot="end">
                    <IonLabel>{t("clan:level_text")}</IonLabel>
                    <IonLabel>
                      {data.data?.data ? (
                        getLevel(req)
                      ) : (
                        <CZLoadText loading={true} />
                      )}
                    </IonLabel>
                  </div>
                )}
              </IonItem>
            </IonCard>
          ))}
        </FancyGrid>
        <ClanRequirementsCard hasLink game_id={new GameID()} />
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UserClanProgressPage;
