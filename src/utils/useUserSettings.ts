import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "react-query";
import { AccountsStorage } from "../storage/Account";
import { LocalSettingsStorage } from "../storage/LocalSettings";
import useStorage from "./useStorage";


export interface UserSettingsUser {
  user_id: number;
  username: string;
}
export interface UserSettingsClan {
  clan_id: number;
  name: string;
  tagline: string;
}

export interface UserSettings {
  users: UserSettingsUser[];
  clans: UserSettingsClan[];
}

const baseURL = "https://server.cuppazee.app";

const getSettings = async (teaken: string, user_id: number): Promise<{ data: UserSettings }> => {
  const response = await fetch(
    `${baseURL}/auth/settings/v1?teaken=${encodeURIComponent(teaken)}&user_id=${encodeURIComponent(
      user_id
    )}`
  );
  if (!response.ok) {
    throw new Error("Expired");
  }
  // TODO: FROM value
  return await response.json();
};

const updateSettings = async (teaken: string, user_id: number, settings: Partial<UserSettings>): Promise<{ data: boolean }> => {
  const response = await fetch(
    `${baseURL}/auth/settings/save/v1`,
    {
      method: "POST",
      body: JSON.stringify({
        teaken,
        user_id,
        settings
      })
    }
  );
  if (!response.ok) {
    throw new Error("Expired");
  }
  // TODO: FROM value
  return await response.json();
};

export function useCloudUserSettings(): (UserSettings & { query?: UseQueryResult }) | null {
  const [accounts] = useStorage(AccountsStorage);

  const account = Object.values(accounts).find(i => i.primary);
  const data = useQuery(
    ["user_settings", account?.teaken, account?.user_id],
    () => (account?.teaken ? getSettings(account.teaken, account.user_id) : null),
    {
      enabled: account?.teaken !== undefined,
    }
  );

  const serverSettings = data.data?.data ? { ...data.data.data, query: data } : null;

  return serverSettings;
}

export default function useUserSettings(): (UserSettings & { query?: UseQueryResult }) | null {
  const [localSettings, _, localSettingsLoaded] = useStorage(LocalSettingsStorage);

  const serverSettings = useCloudUserSettings()

  if (!serverSettings || !localSettingsLoaded) {
    return null;
  }
  return { ...serverSettings, ...localSettings };
}

export function useUserSettingsMutation() {
  const [accounts] = useStorage(AccountsStorage);
  const [localSettings, setLocalSettings, _] = useStorage(LocalSettingsStorage);
  const client = useQueryClient();

  const account = Object.values(accounts).find(i => i.primary);
  const mutation = useMutation<{ data: boolean }, unknown, Partial<UserSettings>>(
    async (settings) => {
      if (account) {
        const d = await updateSettings(account?.teaken, account.user_id, settings);
        client.refetchQueries(["user_settings"]);
        return d;
      }
      return { data: false };
    }
  );

  return (settings: Partial<UserSettings>, forceUpdateCloud?: boolean) => {
    const updateLocal: Partial<UserSettings> = {  };
    const update: Partial<UserSettings> = {  };
    for (const key of Object.keys(settings) as (keyof UserSettings)[]) {
      if ((key as any) === "query") continue;
      if (localSettings[key] !== undefined && localSettings[key] !== null && !forceUpdateCloud) {
        updateLocal[key] = settings[key] as any;
      } else {
        update[key] = settings[key] as any;
      }
    }
    if (Object.keys(updateLocal).length > 0) {
      setLocalSettings(updateLocal);
    }
    if (Object.keys(update).length > 0) {
      mutation.mutate(update);
    }
  };
}
