import { TranslationFormat } from "./lang/data";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "main";
    resources: TranslationFormat;
  }
}
