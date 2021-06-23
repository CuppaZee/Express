import {
  IonContent,
  IonPage,
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

const ClanRequirementsPage: React.FC = ({
}) => {
  const { t } = useTranslation();
  return (
    <IonPage>
      <Header title={t("clan:clan_requirements")} />
      <IonContent fullscreen>
        <ClanRequirementsCard game_id={new GameID()} />
        <ClanRewardsCard game_id={new GameID()} />
        <ClanRequirementsList game_id={new GameID()} />
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default ClanRequirementsPage;
