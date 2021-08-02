import { IonPopover } from "@ionic/react";
import { useTranslation } from "react-i18next";
import useDB from "../../utils/useDB";
import usePopover from "../../utils/usePopover";
import { CZTypeImg } from "../CZImg";
import "./ActivityImg.css";

export interface ActivityImgProps {
  icon: string;
  amount: number;
  points: number;
  small?: boolean;
}

export default function ActivityImg(props: ActivityImgProps) {
  const db = useDB();
  const [popoverState, show] = usePopover();
  const { t } = useTranslation();
  return (
    <>
      <IonPopover className="activity-img-popover" alignment="center" {...popoverState}>
        <CZTypeImg className="activity-img" img={props.icon} />
        <h6 style={{ margin: 0 }}>
          {props.amount}x {db.getType(props.icon)?.name ?? db.strip(props.icon)}
        </h6>
        <div>{t("user_activity:overview_points", { count: props.points })}</div>
      </IonPopover>
      <div
        onClick={show}
        className={
          props.small ? "activity-img-wrapper activity-img-wrapper-small" : "activity-img-wrapper"
        }>
        <CZTypeImg className="activity-img" img={props.icon} />
        <div>{props.amount}</div>
      </div>
    </>
  );
}
