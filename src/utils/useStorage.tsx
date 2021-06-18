import { atom, useAtom, WritableAtom } from "jotai";
import { useEffect } from "react";
import { Storage } from "@ionic/storage";

export function storageAtom<T>(key: string, initial: T) {
  return atom<StorageElement<T>>({ key: "@czexpress/" + key, loaded: false, data: initial });
}

export const store = new Storage().create();

function timeout<T>(prom: Promise<T>, time: number): Promise<T> {
  let timer: any;
  return Promise.race([prom, new Promise<T>((_r, rej) => (timer = setTimeout(rej, time)))]).finally(
    () => clearTimeout(timer)
  );
};

export interface StorageElement<T> {
  data: T;
  loaded: boolean;
  key: string;
}

export default function useStorage<T>(
  atom: WritableAtom<StorageElement<T>, StorageElement<T>> & { loading?: number }
) {
  const [value, setValue] = useAtom(atom);
  useEffect(() => {
    if (!value.loaded && (!atom.loading || atom.loading < Date.now() - 10000)) {
      (async function () {
        atom.loading = Date.now();
        // // @ts-ignore
        // window.___log = [...(window.___log || []), "Loading Store for key: " + value.key];

        const s = await store;
        // // @ts-ignore
        // window.___log = [...(window.___log || []), "Loaded Store for key: " + value.key, s];

        const data = await timeout<any>(s.get(value.key), 5000);
        // // @ts-ignore
        // window.___log = [...(window.___log || []), "Loaded Data for key: " + value.key];

        const jsonData = JSON.parse(data || "null");
        if (typeof value.data === "object" && value.data !== null && !Array.isArray(value.data)) {
          setValue({
            data: { ...value.data, ...(jsonData || {}) },
            loaded: true,
            key: value.key,
          });
        } else {
          setValue({ data: jsonData || value.data, loaded: true, key: value.key });
        }
      })().catch(() => {
        setValue({ data: value.data, loaded: true, key: value.key });
        // // @ts-ignore
        // window.___log = [...(window.___log || []), "Error Loading Data for key: " + value.key, e];
      });
    }
  }, [value.loaded]);
  return [
    value.data,
    (data: T) => {
      setValue({ ...value, data });
      return store.then(s => s.set(value.key, JSON.stringify(data)));
    },
    value.loaded,
  ] as const;
}
