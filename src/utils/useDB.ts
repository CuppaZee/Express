import { loadFromCache, loadFromArrayBuffer, CuppaZeeDB, loadFromLzwJson } from "@cuppazee/db";
import { useEffect, useState } from "react";
import { store } from "./useStorage";

const dbCache: { value: CuppaZeeDB; onLoad: Set<() => void> } = {
  value: new CuppaZeeDB([], [], []),
  onLoad: new Set(),
};

(async function () {
  const cacheData = await (await store).get("@czexpress/dbcache");
  let cacheVersion = 0;
  if (cacheData) {
    const data = JSON.parse(cacheData);
    cacheVersion = data.version;
    dbCache.value = loadFromCache(data);
    dbCache.onLoad.forEach(f => f());
  }
  try {
    const response = await fetch(`https://db.cuppazee.app/lzwmsgpack/${cacheVersion}`);
    const data = await response.arrayBuffer();
    if (data.byteLength > 0) {
      const { db, cache } = loadFromArrayBuffer(data);
      dbCache.value = db;
      dbCache.onLoad.forEach(f => f());
      await(await store).set("@czexpress/dbcache", JSON.stringify(cache));
    }
  } catch (e) {
    const response = await fetch(`https://db.cuppazee.app/lzw/${cacheVersion}`);
    const data = await response.text();
    if (data.length > 0) {
      const { db, cache } = loadFromLzwJson(data);
      dbCache.value = db;
      dbCache.onLoad.forEach(f => f());
      await(await store).set("@czexpress/dbcache", JSON.stringify(cache));
    }
  }
})();

export default function useDB() {
  const [_, setValue] = useState(0);
  useEffect(() => {
    if (dbCache.value) {
      setValue(i => i + 1);
    }
    const f = () => {
      setValue(i => i + 1);
    };
    dbCache.onLoad.add(f);
    return () => { dbCache.onLoad.delete(f) };
  }, []);
  return dbCache.value;
}

export function useDBa() {
  const [c, setValue] = useState(0);
  useEffect(() => {
    if (dbCache.value) {
      setValue(i => i + 1);
    }
    const f = () => {
      setValue(i => i + 1);
    };
    dbCache.onLoad.add(f);
    return () => {
      dbCache.onLoad.delete(f);
    };
  }, []);
  return [c, dbCache.value] as const;
}