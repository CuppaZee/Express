import {
  IonContent,
  IonPage,IonButton,
  useIonRouter,
  useIonPicker,
  IonIcon,
} from "@ionic/react";
import Header from "../../components/Header";

import React from "react";
import Tabs from "../../components/Tabs";
import {
  GameID,
} from "@cuppazee/utils";
import ClanRequirementsCard from "../../components/Clan/Requirements";
import ClanRequirementsList from "../../components/Clan/RequirementsList";
import ClanRewardsCard from "../../components/Clan/Rewards";
import { useTranslation } from "react-i18next";
import { RouteChildrenProps } from "react-router";
import blankAnimation from "../../utils/blankAnimation";
import dayjs from "dayjs";
import { chevronDown } from "ionicons/icons";

const ClanRequirementsPage: React.FC<
  RouteChildrenProps<{ month?: string; year?: string }>
> = ({ match }) => {
  const params = match?.params;
  const { t } = useTranslation();

  const game_id = params?.year
    ? new GameID(Number(params.year), Number(params.month) - 1)
    : new GameID();
  
  const history = useIonRouter();
  const [present] = useIonPicker();
  return (
    <IonPage>
      <Header title={t("clan:clan_requirements")} />
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
                      game_id.game_id === new GameID().game_id ? "/clans/requirements" : `/clans/requirements/${game_id.month + 1}/${game_id.year}`,
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
                  options: new Array(new GameID().game_id - 77)
                    .fill(0)
                    .map((_, n) => new GameID(79 + n))
                    .map(i => ({
                      text: `Battle ${i.game_id} - ${dayjs(i.date).format("MMMM YYYY")}`,
                      value: i,
                    }))
                    .reverse(),
                  selectedIndex: new GameID().game_id + 1 - game_id.game_id,
                },
              ],
            });
          }}>
          {dayjs(game_id.date).format("MMMM YYYY")}
          <IonIcon icon={chevronDown} />
        </IonButton>
        <ClanRequirementsCard game_id={game_id} />
        <ClanRewardsCard game_id={game_id} />
        <ClanRequirementsList game_id={game_id} />
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default ClanRequirementsPage;
