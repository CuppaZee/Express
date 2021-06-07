import { IonPopover } from "@ionic/react";
import useDB from "../../utils/useDB";
import usePopover from "../../utils/usePopover";
import { CZTypeImg } from "../CZImg";
import "./ActivityImg.css";

export interface ActivityImgProps {
  icon: string;
  amount: number;
  small?: boolean;
}

export default function ActivityImg(props: ActivityImgProps) {
  const db = useDB();
  const [popoverState, show] = usePopover();
  return (
    <>
      <IonPopover cssClass="activity-img-popover" {...popoverState}>
        <CZTypeImg className="activity-img" img={props.icon} />
        <p>
          {props.amount}x {db.getType(props.icon)?.name ?? db.strip(props.icon)}
        </p>
      </IonPopover>
      <div
        onClick={show}
        className={
          props.small ? "activity-img-wrapper activity-img-wrapper-small" : "activity-img-wrapper"
        }>
        <CZTypeImg className="activity-img" img={props.icon} />
        {props.amount}
      </div>
    </>
  );
}
