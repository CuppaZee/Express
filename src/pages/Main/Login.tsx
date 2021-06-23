import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  isPlatform,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import "./Login.css";
import { Browser } from "@capacitor/browser";
import { App, URLOpenListener } from "@capacitor/app";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AppIcon from "./AppIcon";
import useStorage from "../../utils/useStorage";
import { AccountsStorage } from "../../storage/Account";
import omit from "../../utils/omit";
import { arrowForward, close, star } from "ionicons/icons";
import { ThemeStorage } from "../../storage/Theme";
import { ReadyStorage } from "../../storage/Ready";
import Header from "../../components/Header";
import blankAnimation from "../../utils/blankAnimation";
import { LANGS } from "../../lang/i18n";
import { useTranslation } from "react-i18next";
import useUserSettings, { useUserSettingsMutation } from "../../utils/useUserSettings";
const configs = {
  main: {
    redirect_uri: "https://server.cuppazee.app/auth/auth/v1",
    client_id: "91714935879f433364bff187bda66183",
  },
  dev: {
    redirect_uri: "http://nextserver.cuppazee.app/auth/auth/v1",
    client_id: "628ed7ab83b0a6f59674f1bf04e4afa2",
  },
  team: {
    client_id: "c983d59354542f8d15e11924ed61bae6",
    redirect_uri: "https://server.cuppazee.app/auth/auth/team/v1",
  },
  universal: {
    client_id: "64f148f57d1d7c62e44a90e5f3661432",
    redirect_uri: "https://server.cuppazee.app/auth/auth/universal/v1",
  },
};

function Login() {
  const pageTitle = "CuppaZee Express";
  const { i18n, t } = useTranslation();
  const [customIconSupported, setCustomIconSupported] = useState(false);
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  useEffect(() => {
    AppIcon?.isSupported().then(({ value }) => {
      setCustomIconSupported(value);
      AppIcon?.getName().then(({ value }) => {
        setCustomIcon(value);
      });
    });
  }, []);
  const location = useLocation();
  const history = useIonRouter();
  const params = new URLSearchParams(location.search);
  const [present] = useIonToast();
  const [accounts, setAccounts] = useStorage(AccountsStorage);
  const [theme, setTheme] = useStorage(ThemeStorage);
  const [_ready, setReady] = useStorage(ReadyStorage);
  const config = configs.main;
  const redirectUri = !isPlatform("capacitor")
    ? [window.location.origin, window.location.pathname.slice(1)].filter(Boolean).join("/")
    : `app.cuppazee.express://more`;
  const userSettings = useUserSettings();
  const updateUserSettings = useUserSettingsMutation();
  useEffect(() => {
    if (params.get("access_token")) {
      const [teaken, username, user_id] = decodeURIComponent(
        params.get("access_token") || ""
      ).split("/");
      setAccounts({
        ...accounts,
        [user_id]: {
          teaken,
          username,
          user_id: Number(user_id),
          primary: !Object.values(accounts).some(i => i.primary && i.user_id !== Number(user_id)),
        },
      }).then(() => {
        history.push(`/more`, undefined, "replace", undefined, blankAnimation);
      });
      present({
        duration: 2000,
        color: "success",
        message: t("settings:accounts_success", {player: username}),
      });
    }
  }, [params.get("access_token")]);
  useEffect(() => {
    const r = App.addListener("appUrlOpen", async o => {
      try {
        await Browser.close();
      } catch (e) { }
      const params = new URL(o.url).searchParams;
      if (params.has("access_token")) {
        const [teaken, username, user_id] = decodeURIComponent(
          params.get("access_token") || ""
        ).split("/");
        setAccounts({
          ...accounts,
          [user_id]: {
            teaken,
            username,
            user_id: Number(user_id),
            primary: !Object.values(accounts).some(i => i.primary && i.user_id !== Number(user_id)),
          },
        });
        present({
          duration: 2000,
          color: "success",
          message: t("settings:accounts_success", { player: username }),
        });
      }
    });
    return () => {r.then(i => i.remove())}
  }, [accounts]);
  return (
    <IonPage>
      <Header title={pageTitle} />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{pageTitle}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="login-content-wrapper">
          <div className="login-content">
            <IonCard>
              <IonCardContent>{t("welcome:continuing_policy")}</IonCardContent>
              <IonCardContent className="login-legal-buttons">
                <IonButton
                  onClick={() => Browser.open({ url: "https://server.cuppazee.app/terms" })}>
                  {t("welcome:terms")}
                </IonButton>
                <IonButton
                  onClick={() => Browser.open({ url: "https://server.cuppazee.app/privacy" })}>
                  {t("welcome:privacy")}
                </IonButton>
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{t("pages:settings_personalisation")}</IonCardTitle>
              </IonCardHeader>
              <IonItem>
                <IonLabel>{t("settings:language_title")}</IonLabel>
                <IonSelect
                  value={i18n.language}
                  onIonChange={ev => {
                    i18n.changeLanguage(ev.detail.value);
                  }}>
                  {LANGS.map(lang => (
                    <IonSelectOption key={lang[0]} value={lang[0]}>
                      {lang[1]}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>{t("settings:theme_title")}</IonLabel>
                <IonSelect
                  value={theme.style}
                  onIonChange={ev => setTheme({ ...theme, style: ev.detail.value })}>
                  <IonSelectOption value="system">{t("settings:theme_system")}</IonSelectOption>
                  <IonSelectOption value="light">{t("settings:theme_light")}</IonSelectOption>
                  <IonSelectOption value="dark">{t("settings:theme_dark")}</IonSelectOption>
                </IonSelect>
              </IonItem>
              {customIconSupported && (
                <IonItem>
                  <IonLabel>{t("settings:app_icon_title")}</IonLabel>
                  <IonSelect
                    value={customIcon ?? "teal"}
                    onIonChange={ev => {
                      setCustomIcon(ev.detail.value);
                      AppIcon?.change({ name: ev.detail.value, suppressNotification: false });
                    }}>
                    {(
                      [
                        "fade",
                        "teal",
                        "green",
                        "black",
                        "darkblue",
                        "orange",
                        "pink",
                        "purple",
                        "red",
                      ] as const
                    ).map(i => (
                      <IonSelectOption key={i} value={i}>
                        {t(`settings:app_icon_${i}` as const)}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              )}
            </IonCard>
            <IonCard>
              <IonItem lines="none" className="item-card-header">
                <IonCardTitle>{t("welcome:accounts")}</IonCardTitle>

                {Object.entries(accounts).length > 0 && (
                  <IonButton
                    onClick={() => {
                      setAccounts({});
                      setReady({ date: "" });
                    }}
                    color="danger"
                    slot="end">
                    Sign Out
                  </IonButton>
                )}
              </IonItem>
              {Object.entries(accounts)
                .sort((a, b) => (b[1].primary ? 1 : 0) - (a[1].primary ? 1 : 0))
                .map(([accKey, acc]) => (
                  <IonItem key={acc.user_id}>
                    <IonAvatar slot="start">
                      <img
                        src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                          acc.user_id
                        ).toString(36)}.png`}
                      />
                    </IonAvatar>
                    <IonLabel>
                      {acc.primary && <IonIcon slot="end" icon={star} />}
                      {acc.username}
                    </IonLabel>
                    {!acc.primary && (
                      <IonButton
                        onClick={() => {
                          setAccounts(omit(accounts, accKey));
                        }}
                        color="danger"
                        slot="end">
                        <IonIcon icon={close} />
                      </IonButton>
                    )}
                  </IonItem>
                ))}
              <IonCardContent className="login-login-buttons">
                <IonButton
                  color="success"
                  onClick={async () => {
                    const t = Math.floor(Math.random() * 10000) + 1;
                    if (!isPlatform("capacitor")) {
                      window.location.href = `https://api.munzee.com/oauth?client_id=${
                        config.client_id
                      }&redirect_uri=${encodeURIComponent(
                        config.redirect_uri
                      )}&scope=read&response_type=code&state=${encodeURIComponent(
                        JSON.stringify({
                          redirect: redirectUri,
                          platform: isPlatform("android")
                            ? "android"
                            : isPlatform("ios")
                            ? "ios"
                            : "web",
                          ionic: t.toString(),
                        })
                      )}`;
                      return;
                    }
                    await Browser.open({
                      url: `https://api.munzee.com/oauth?client_id=${
                        config.client_id
                      }&redirect_uri=${encodeURIComponent(
                        config.redirect_uri
                      )}&scope=read&response_type=code&state=${encodeURIComponent(
                        JSON.stringify({
                          redirect: redirectUri,
                          platform: isPlatform("android")
                            ? "android"
                            : isPlatform("ios")
                            ? "ios"
                            : "web",
                          ionic: t.toString(),
                        })
                      )}`,
                      presentationStyle: "popover",
                    });
                  }}>
                  {Object.keys(accounts).length === 0
                    ? t("welcome:login")
                    : t("settings:accounts_add")}
                </IonButton>
              </IonCardContent>
            </IonCard>
            {!Object.values(accounts).some(i => i.primary) && (
              <IonText className="login-continue-message">
                {t("welcome:login_required")}
              </IonText>
            )}
            {Object.values(accounts).some(i => i.primary) && (
              <IonButton
                className="login-continue"
                disabled={!Object.values(accounts).some(i => i.primary) || !userSettings}
                color="primary"
                onClick={() => {
                  if (userSettings) {
                    const newSettings = { users: userSettings.users };
                    for (const user in accounts) {
                      if (!newSettings.users.some(i => i.user_id === accounts[user].user_id))
                        newSettings.users = [
                          ...newSettings.users,
                          { user_id: accounts[user].user_id, username: accounts[user].username },
                        ];
                    }
                    updateUserSettings(newSettings);
                    history.push(
                      `/player/${Object.values(accounts).find(i => i.primary)?.username}`,
                      undefined,
                      "replace",
                      undefined,
                      blankAnimation
                    );
                    setReady({ date: "2021-06-18" });
                  }
                }}>
                {t("welcome:continue")} <IonIcon icon={arrowForward} />
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Login;
