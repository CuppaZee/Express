import { IonItem, IonLabel, IonProgressBar, IonNote } from "@ionic/react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import useMunzeeData from "../../utils/useMunzeeData";
import { useTokenStatus } from "../../utils/useToken";
import { CZTypeImg } from "../CZImg";
import "./Overview.css";

export interface ZeeOpsOverviewProps {
  user_id: number;
}

export default function ZeeOpsOverview({ user_id }: ZeeOpsOverviewProps) {
  const data = useMunzeeData({
    endpoint: "ops/zeeops/status",
    params: {
      user_id,
    },
    user_id,
  });
  const { t } = useTranslation();
  if (data.tokenStatus === useTokenStatus.Missing) return null;
  if (!data.data?.data) {
    return null;
  }
  const d = data.data.data;
  let current = d.missions.find(i => i.id === d.currentMission);
  if (dayjs(d.start_time).valueOf() > Date.now() && d.currentMission === 1) {
    return (
      <div className="zeeops-item-wrapper">
        <IonItem className="zeeops-item" lines="none">
          <div className="zeeops-item-reward" slot="start">
            <CZTypeImg slot="start" img="cog" />
            <IonNote>5</IonNote>
          </div>
          <div className="zeeops-item-label">
            <h6>{t("user_zeeops:weekly_reward", { item: "5 Cogs" })}</h6>
          </div>
        </IonItem>
      </div>
    );
  } else if (dayjs.mhqParse(d.start_time).valueOf() > Date.now()) {
    current = d.missions.find(i => i.id === d.currentMission - 1);
  }
  if (!current) return null;
  return (
    <div className="zeeops-item-wrapper">
      <IonItem className="zeeops-item" lines="none">
        <div className="zeeops-item-reward" slot="start">
          <CZTypeImg
            slot="start"
            img={current.rewards[0].imageUrl.slice(0, -4)}
          />
          <IonLabel>{current.rewards[0].amount}</IonLabel>
        </div>
        <div className="zeeops-item-label">
          <IonLabel>{current.description}</IonLabel>

          <div className="zeeops-progress-wrapper">
            <IonProgressBar value={current.progress / current.goal} />
            {!current.rewardCollected ? (
              <h6>
                {current.progress} / {current.goal}
              </h6>
            ) : (
              <h4>{t("user_zeeops:collected")}</h4>
            )}
          </div>
        </div>
      </IonItem>
    </div>
  );
  // return (
  //   <View
  //     style={{
  //       flexDirection: "row",
  //       padding: 4,
  //       alignItems: "center",
  //       justifyContent: "center",
  //     }}>
  //     <View>
  //       <TypeImage
  //         style={{ size: 36, margin: 4 }}
  //         icon={current?.rewards[0].imageUrl.slice(0, -4)}
  //       />
  //       {current?.rewards[0].amount > 1 && (
  //         <Text style={{ textAlign: "center", marginTop: -4 }} category="c1">
  //           x{current?.rewards[0].amount}
  //         </Text>
  //       )}
  //     </View>
  //     <View style={{ flex: 1, maxWidth: 400 }}>
  //       <Text category="s1" style={{ padding: 4 }}>
  //         {current?.description}
  //       </Text>
  //       <Layout level="4" style={{ borderRadius: 8 }}>
  //         <LinearGradient
  //           start={[0, 0.5]}
  //           end={[1, 0.5]}
  //           locations={[
  //             0,
  //             (current.rewardCollected ? current.goal : current?.progress) / current.goal,
  //             (current.rewardCollected ? current.goal : current?.progress) / current.goal + 0.0001,
  //             2,
  //           ]}
  //           colors={[
  //             theme["text-success-color"] + "66",
  //             theme["text-success-color"] + "66",
  //             "transparent",
  //             "transparent",
  //           ]}
  //           style={{
  //             padding: 4,
  //             borderRadius: 8,
  //             borderWidth: 1,
  //             borderColor: theme["border-basic-color-1"],
  //           }}>
  //           <Text category="s1" style={{ textAlign: "center" }}>
  //             {current.rewardCollected
  //               ? t("user_zeeops:collected")
  //               : `${current?.progress}/${current?.goal}`}
  //           </Text>
  //         </LinearGradient>
  //       </Layout>
  //     </View>
  //   </View>
  // );
}
