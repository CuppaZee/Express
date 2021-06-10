import { storageAtom } from "../utils/useStorage";

export interface ClanSettings {
  goal: number;
  hideShadow: boolean;
  subtract: boolean;
}

export const ClansSettingsStorage = storageAtom<{ [clan_id in string]?: ClanSettings }>("clans/settings", {});