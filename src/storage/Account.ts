import { storageAtom } from "../utils/useStorage";

export interface Account {
  user_id: number;
  username: string;
  teaken: string;
}

export const AccountsStorage = storageAtom<{ [user_id: string]: Account }>("accounts", {});