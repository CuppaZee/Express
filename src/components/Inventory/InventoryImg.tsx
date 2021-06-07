import { IonPopover } from "@ionic/react";
import usePopover from "../../utils/usePopover";
import { CZTypeImg } from "../CZImg";
import "./InventoryImg.css";
import { UserInventoryItem } from "@cuppazee/utils";

export interface InventoryImgProps {
  item: UserInventoryItem;
}

export default function InventoryImg({ item }: InventoryImgProps) {
  const [popoverState, show] = usePopover();
  return (
    <>
      <IonPopover cssClass="inventory-img-popover" {...popoverState}>
        <CZTypeImg className="inventory-img" img={item.icon ?? item.name ?? ""} />
        <p>
          {item.amount}x {item.name}
        </p>
      </IonPopover>
      <div
        onClick={show}
        className={`inventory-img-wrapper ${item.amount ? "" : "inventory-img-wrapper-none"}`}>
        <CZTypeImg
          className="inventory-img"
          img={item.icon ?? item.name ?? ""}
        />
        {item.amount}
      </div>
    </>
  );
}
