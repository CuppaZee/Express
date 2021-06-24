import { IonImg } from "@ionic/react";
import { useEffect, useState } from "react";

type IonImgProps = NonNullable<typeof IonImg["defaultProps"]>;

const formatSupport: {
  value: [webp: boolean, avif: boolean] | null;
  onUpdate: Set<(v: [webp: boolean, avif: boolean]) => void>;
} = {
  value: null,
  onUpdate: new Set(),
};

async function supportsWebp() {
  if (!(window || globalThis).createImageBitmap) return false;

  const webpData = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
  const blob = await fetch(webpData).then(r => r.blob());
  return createImageBitmap(blob).then(
    () => true,
    () => false
  );
}
async function supportsAvif() {
  if (!(window || globalThis).createImageBitmap) return false;

  const avifData =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAF0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgS0AAAAAABNjb2xybmNseAACAAIAAIAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAGVtZGF0EgAKBzgAPtAgIAkyUBAAAPWc41TP///4gHBX9H8XVK7gGeDllq8TYARA+8Tfsv7L+zPE24eIoIzE0WhHbrqcrTK9VEgEG/hwgB5rdCbvP8g3KYPdV88CvPJnptgQ";
  const blob = await fetch(avifData).then(r => r.blob());
  return createImageBitmap(blob).then(
    () => true,
    () => false
  );
}
Promise.all([supportsWebp(), supportsAvif()] as const).then(i => {
  formatSupport.value = i;
  formatSupport.onUpdate.forEach(f => f(i));
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
  const [loaded, setLoaded] = useState("");
  return <CZImg onIonImgDidLoad={() => {
    if (loaded !== img) {
      setLoaded(img);
    }
  }} {...props} img={img} type="types" className={props.className + (loaded !== img ? " cztypeimgloading" : "")} />
}

export function CZImg({ img, type, size, ...props }: CZImgProps) {
  const [formats, setFormats] = useState(formatSupport.value);
  useEffect(() => {
    if (formats === null) {
      const f = (i: [boolean, boolean]) => {
        setFormats(i);
      };
      if (formatSupport.value) {
        f(formatSupport.value);
        return () => {}
      }
      formatSupport.onUpdate.add(f);
      return () => {
        formatSupport.onUpdate.delete(f);
      };
    }
  }, [formats])
  let f: string | null = null;
  if (formats) {
    if (formats[1]) {
      f = "avif";
    } else if (formats[0]) {
      f = "webp"
    } else {
      f = "png"
    }
  }
  return <IonImg {...props} src={f ? `https://images.cuppazee.app/${type}/${size ?? 64}/${encodeURIComponent(img)}.${f}` : undefined} />;
}