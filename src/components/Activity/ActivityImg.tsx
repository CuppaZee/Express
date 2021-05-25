import { IonPopover } from "@ionic/react";
import usePopover from "../../utils/usePopover";
import { CZTypeImg } from "../CZImg";
import "./ActivityImg.css";
import types from "@cuppazee/types";

export interface ActivityImgProps {
  icon: string;
  amount: number;
  small?: boolean;
}

export default function ActivityImg(props: ActivityImgProps) {
  const [popoverState, show] = usePopover();
  return (
    <>
      <IonPopover cssClass="activity-img-popover" {...popoverState}>
        <CZTypeImg className="activity-img" img={props.icon} />
        <p>
          {props.amount}x {types.getType(props.icon)?.name ?? types.strip(props.icon)}
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
