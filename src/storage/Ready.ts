import { storageAtom } from "../utils/useStorage";

export interface ReadySelection {
  date: string;
}

export const ReadyStorage = storageAtom<ReadySelection>("ready", { date: "" });