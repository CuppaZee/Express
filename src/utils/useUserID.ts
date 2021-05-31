import { AccountsStorage } from "../storage/Account";
import useMunzeeData from "./useMunzeeData";
import useStorage from "./useStorage";

export const userIDCache = new Map<string, number>();
export function addUserIDs(users: [username: string, user_id: number][]) {
  for (const user of users) {
    userIDCache.set(user[0], user[1]);
  }
}

export default function useUserID(username: string = "") {
  const [accounts] = useStorage(AccountsStorage);
  const user_id =
    userIDCache.get(username) ??
    Object.values(accounts).find(i => i.username.toLowerCase() === username.toLowerCase())
      ?.user_id ??
    null;

  const user = useMunzeeData({
    endpoint: "user",
    params: { username },
    options: {
      enabled: !!username && !user_id,
    },
  });
  return user_id ?? user.data?.data?.user_id ?? null;
}
