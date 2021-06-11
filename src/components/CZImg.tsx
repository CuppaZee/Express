import { IonImg } from "@ionic/react";
import { useEffect, useState } from "react";

type IonImgProps = NonNullable<typeof IonImg["defaultProps"]>;

const supportedWebP: {value: boolean | null, onUpdate: Set<(v: boolean) => void>} = {
  value: null,
  onUpdate: new Set(),
}

async function supportsWebp() {
  if (!(window || globalThis).createImageBitmap) return false;

  const webpData = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
  const blob = await fetch(webpData).then(r => r.blob());
  return createImageBitmap(blob).then(
    () => true,
    () => false
  );
}
supportsWebp().then(i => {
  supportedWebP.value = i;
  supportedWebP.onUpdate.forEach(f => f(i));
});

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
  return <CZImg {...props} img={img} type="types" />
}

export function CZImg({ img, type, size, ...props }: CZImgProps) {
  const [webP, setWebP] = useState(supportedWebP.value);
  useEffect(() => {
    if (webP === null) {
      const f = (i: boolean) => {
        setWebP(i);
      };
      supportedWebP.onUpdate.add(f);
      return () => {
        supportedWebP.onUpdate.delete(f);
      };
    }
  }, [webP])
  return <IonImg {...props} src={`https://images.cuppazee.app/${type}/${size ?? 64}/${encodeURIComponent(img)}.${webP ? "webp" : (webP === false ? "png" : null)}`} />;
}