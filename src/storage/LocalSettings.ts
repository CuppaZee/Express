import { UserSettings } from "../utils/useUserSettings";
import { storageAtom } from "../utils/useStorage";

export const LocalSettingsStorage = storageAtom<Partial<UserSettings>>("local_settings", {});