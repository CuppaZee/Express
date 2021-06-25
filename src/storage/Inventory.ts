import { storageAtom } from "../utils/useStorage";

export interface InventorySettings {
  hideZeroes: boolean;
  groupByState: boolean;
}

export const InventorySettingsStorage = storageAtom<InventorySettings>("inventory", {
  hideZeroes: false,
  groupByState: false,
});