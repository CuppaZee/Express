import { Type } from "@cuppazee/db/lib";
import { IonPopover } from "@ionic/react";
import usePopover from "../../utils/usePopover";
import { CZTypeImg } from "../CZImg";
import "./CaptureImg.css";

export interface CaptureImgProps {
  type: Type;
  count: number;
}

export default function CaptureImg({ type, count }: CaptureImgProps) {
  const [popoverState, show] = usePopover();
  return (
    <>
      <IonPopover className="capture-img-popover" alignment="center" {...popoverState}>
        <CZTypeImg className="capture-img" img={type.icon} />
        <p>
          {count}x {type.name}
        </p>
      </IonPopover>
      <div
        onClick={show}
        className={`capture-img-wrapper ${count ? "" : "capture-img-wrapper-none"}`}>
        <CZTypeImg className="capture-img" img={type.icon} />
        <div>{type.name}</div>
        <div>{count || (["munzee"].includes(type.id) ? "?" : "-")}</div>
      </div>
    </>
  );
}
