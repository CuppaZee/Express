import { storageAtom } from "../utils/useStorage";

export interface Account {
  user_id: number;
  username: string;
  teaken: string;
  primary?: boolean;
}

export const AccountsStorage = storageAtom<{ [user_id: string]: Account }>("accounts/v2", {});