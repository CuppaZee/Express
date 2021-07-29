import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { store } from '../utils/useStorage';

// the translations
// (tip move them in a JSON file and import them)
import {langs} from "./data";
import dayjs, { Dayjs } from "dayjs";

i18n
  .use(HttpBackend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    react: {
      useSuspense: false,
    },
    // resources: {
    //   "en-GB": langs["en-GB"]
    // },
    // partialBundledLanguages: true,
    load: "currentOnly",
    lng: "en-GB",
    fallbackLng: "en-GB",
    preload: ["en-GB"],
    defaultNS: "main",
    nsSeparator: "__",
    ns: "main",

    backend: {
      // backends: [
      //   HttpBackend,
      //   resourcesToBackend(langs),
      // ],
      // backendOptions: [
      //   {
      loadPath: "https://db.cuppazee.app/translations/{{lng}}",
    },
    //   ],
    // } as any,

    // keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      alwaysFormat: true,
      format(value, format, lng) {
        if (typeof value === "object") {
          if (value instanceof Dayjs || value instanceof Date) {
            return dayjs(value).format("L LTS");
          }
        } else if (typeof value === "number") {
          try {
            return value.toLocaleString(lng);
          } catch {
            return value.toLocaleString();
          }
        }
        return value;
      },
      escapeValue: false, // react already safes from xss
    },
  });

i18n.on("languageChanged", (lang) => {
  store.then(s => s.set("LANG", lang));
  dayjs.locale(lang === "test" ? "x-pseudo" : lang.toLowerCase());
})

store.then(s => s.get("LANG").then((r) => {
  if (r === "en-US") {
    i18n.changeLanguage("en");
    s.set("LANG", "en");
  } else if (r) {
    i18n.changeLanguage(r);
  } else {
    dayjs.locale("en-gb");
  }
}));

export const LANGS = [
  ["cs", "Čeština"],
  // ["da", "Dansk"],
  ["de", "Deutsch"],
  ["en-GB", "English (UK)"],
  ["en", "English (US)"],
  ["fi", "Suomi"],
  // ["fr", "Français (CA)"],
  // ["hu", "Magyar"],
  ["nl", "Nederlands"],
  ["test", "Emojis"],
];

export default i18n;
