import { IonImg } from "@ionic/react";
import useDB from "../utils/useDB";

type IonImgProps = NonNullable<typeof IonImg["defaultProps"]>;

export interface CZImgProps extends Omit<IonImgProps, "src"> {
  img: string;
  type: string;
  size?: number;
}

export interface CZTypeImgProps extends Omit<IonImgProps, "src"> {
  img: string;
  size?: number;
}

export function CZTypeImg({ img, ...props }: CZTypeImgProps) {
  const db = useDB();
  return <CZImg {...props} img={db.strip(img)} type="types" />
}

export function CZImg({ img, type, size, ...props }: CZImgProps) {
  return <IonImg {...props} src={`https://images.cuppazee.app/${type}/${size ?? 64}/${img}.png`} />;
}