import { atom, useAtom, WritableAtom } from "jotai";
import { useEffect } from "react";
import { Storage } from "@ionic/storage";


export function storageAtom<T>(key: string, initial: T) {
  return atom<StorageElement<T>>({ key: "@czexpress/" + key, loaded: false, data: initial });
}

export const store = new Storage().create();

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
      atom.loading = Date.now();
      store.then(s =>
        s.get(value.key).then(data => {
          const jsonData = JSON.parse(data || "null");
          if (typeof value.data === "object" && !Array.isArray(value.data)) {
            setValue({
              data: { ...value.data, ...(jsonData || {}) },
              loaded: true,
              key: value.key,
            });
          } else {
            setValue({ data: jsonData || value.data, loaded: true, key: value.key });
          }
        })
      );
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
