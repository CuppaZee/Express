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
  IonTitle,
  IonToolbar,
  isPlatform,
  useIonRouter,
  useIonToast,
  IonReorderGroup,
  IonReorder,
  useIonAlert,
} from "@ionic/react";
import "./Settings.css";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AppIcon from "./AppIcon";
import useStorage from "../../utils/useStorage";
import { AccountsStorage } from "../../storage/Account";
import omit from "../../utils/omit";
import {
  close,
  cloud,
  cloudOffline,
  lockOpenOutline,
  personOutline,
  shieldOutline,
  star,
} from "ionicons/icons";
import { ThemeStorage } from "../../storage/Theme";
import { ReadyStorage } from "../../storage/Ready";
import Header from "../../components/Header";
import blankAnimation from "../../utils/blankAnimation";
import { LANGS } from "../../lang/i18n";
import { useTranslation } from "react-i18next";
import Tabs from "../../components/Tabs";
import useUserSettings, { useCloudUserSettings, useUserSettingsMutation } from "../../utils/useUserSettings";
import SearchModal from "../../components/Search/User";
import CZRefresher from "../../components/CZRefresher";
import { LocalSettingsStorage } from "../../storage/LocalSettings";
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

function Settings() {
  const { i18n, t } = useTranslation();
  const pageTitle = t("pages:settings");
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
  const [presentAlert] = useIonAlert();
  const [accounts, setAccounts] = useStorage(AccountsStorage);
  const [theme, setTheme] = useStorage(ThemeStorage);
  const [_, setReady] = useStorage(ReadyStorage);
  const [searchModal, setSearchModal] = useState<"players" | "clans" | null>(null);
  const config = configs.main;
  const redirectUri = !isPlatform("capacitor")
    ? [window.location.origin, window.location.pathname.slice(1)].filter(Boolean).join("/")
    : `app.cuppazee.express://more`;
  const userSettings = useUserSettings();
  const [localSettings, setLocalSettings] = useStorage(LocalSettingsStorage);
  const cloudUserSettings = useCloudUserSettings();
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
        message: `Successfully logged in as ${username}`,
      });
    }
  }, [params.get("access_token")]);
  useEffect(() => {
    const r= App.addListener("appUrlOpen", async o => {
      try {
        await Browser.close();
      } catch (e) {}
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
          message: `Successfully logged in as ${username}`,
        });
      }
    });
    return () => {r.then(i=>i.remove())}
  }, []);
  return (
    <IonPage>
      <Header title={pageTitle} />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{pageTitle}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {userSettings?.query && <CZRefresher queries={[userSettings.query]} />}
        <SearchModal
          open={searchModal !== null}
          onClose={() => setSearchModal(null)}
          onSelect={value => {
            if (userSettings) {
              if (
                "clan_id" in value &&
                !userSettings.clans.find(i => i.clan_id === value.clan_id)
              ) {
                updateUserSettings({
                  clans: [...userSettings.clans, value],
                });
              } else if (
                "user_id" in value &&
                !userSettings.users.find(i => i.user_id === value.user_id)
              ) {
                updateUserSettings({
                  users: [...userSettings.users, value],
                });
              }
            }
            setSearchModal(null);
          }}
          filter={searchModal || "all"}
        />
        <div className="login-content-wrapper">
          <div className="login-content">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{t("pages:settings_personalisation")}</IonCardTitle>
              </IonCardHeader>
              <IonItem disabled>
                <IonLabel>{t("settings:language_title")}</IonLabel>
                <IonSelect
                  disabled
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
                  <IonIcon icon={lockOpenOutline} /> {t("welcome:add_another")}
                </IonButton>
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonItem lines="none" className="item-card-header">
                <IonCardTitle>Players</IonCardTitle>
                {localSettings.users ? (
                  <IonButton
                    onClick={() => {
                      presentAlert({
                        header: "Enable Cloud Syncing for Players?",
                        message: "Your Players will be synchronised with your other devices.",
                        buttons: [
                          "Cancel",
                          {
                            text: "Enable Cloud Syncing",
                            handler: () => {
                              const cloud = cloudUserSettings?.users ?? [];
                              const local = localSettings.users ?? [];
                              updateUserSettings(
                                {
                                  users: [
                                    ...cloud,
                                    ...local.filter(i => !cloud.some(c => c.user_id === i.user_id)),
                                  ],
                                },
                                true
                              );
                              setLocalSettings(omit(localSettings, "users"));
                            },
                          },
                        ],
                      });
                    }}
                    color="success"
                    slot="end">
                    <IonIcon icon={cloud} />
                    &nbsp;Enable Cloud Syncing
                  </IonButton>
                ) : (
                  <IonButton
                    onClick={() => {
                      presentAlert({
                        header: "Disable Cloud Syncing for Players?",
                        message: "Your Players will no longer be synchronised with other devices.",
                        buttons: [
                          "Cancel",
                          {
                            text: "Disable Cloud Syncing",
                            handler: () => {
                              setLocalSettings({ ...localSettings, users: userSettings?.users });
                            },
                          },
                        ],
                      });
                    }}
                    color="danger"
                    slot="end">
                    <IonIcon icon={cloudOffline} />
                    &nbsp;Disable Cloud Syncing
                  </IonButton>
                )}
              </IonItem>
              <IonReorderGroup
                onIonItemReorder={ev => {
                  if (userSettings) {
                    updateUserSettings({
                      users: ev.detail.complete(userSettings.users),
                    });
                  }
                }}
                disabled={false}>
                {userSettings?.users.map((user, userIndex) => (
                  <IonItem key={user.user_id}>
                    <IonReorder slot="start" />
                    <IonAvatar slot="start">
                      <img
                        src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                          user.user_id
                        ).toString(36)}.png`}
                      />
                    </IonAvatar>
                    <IonLabel>{user.username}</IonLabel>
                    <IonButton
                      onClick={() => {
                        updateUserSettings({
                          users: [
                            ...userSettings.users.slice(0, userIndex),
                            ...userSettings.users.slice(userIndex + 1),
                          ],
                        });
                      }}
                      color="danger"
                      slot="end">
                      <IonIcon icon={close} />
                    </IonButton>
                  </IonItem>
                ))}
              </IonReorderGroup>
              {!userSettings?.users.length && (
                <IonCardContent>
                  It's looking a bit empty here. Press the button below to add your first player!
                </IonCardContent>
              )}
              <IonCardContent className="login-login-buttons">
                <IonButton color="success" onClick={() => setSearchModal("players")}>
                  <IonIcon icon={personOutline} /> Add Player
                </IonButton>
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonItem lines="none" className="item-card-header">
                <IonCardTitle>Clans</IonCardTitle>
                {localSettings.clans ? (
                  <IonButton
                    onClick={() => {
                      presentAlert({
                        header: "Enable Cloud Syncing for Clans?",
                        message: "Your Clans will be synchronised with your other devices.",
                        buttons: [
                          "Cancel",
                          {
                            text: "Enable Cloud Syncing",
                            handler: () => {
                              const cloud = cloudUserSettings?.clans ?? [];
                              const local = localSettings.clans ?? [];
                              updateUserSettings(
                                {
                                  clans: [
                                    ...cloud,
                                    ...local.filter(i => !cloud.some(c => c.clan_id === i.clan_id)),
                                  ],
                                },
                                true
                              );
                              setLocalSettings(omit(localSettings, "clans"));
                            },
                          },
                        ],
                      });
                    }}
                    color="success"
                    slot="end">
                    <IonIcon icon={cloud} />
                    &nbsp;Enable Cloud Syncing
                  </IonButton>
                ) : (
                  <IonButton
                    onClick={() => {
                      presentAlert({
                        header: "Disable Cloud Syncing for Clans?",
                        message:
                          "Your Clans will no longer be synchronised with your other devices.",
                        buttons: [
                          "Cancel",
                          {
                            text: "Disable Cloud Syncing",
                            handler: () => {
                              setLocalSettings({ ...localSettings, clans: userSettings?.clans });
                            },
                          },
                        ],
                      });
                    }}
                    color="danger"
                    slot="end">
                    <IonIcon icon={cloudOffline} />
                    &nbsp;Disable Cloud Syncing
                  </IonButton>
                )}
              </IonItem>
              <IonReorderGroup
                onIonItemReorder={ev => {
                  if (userSettings) {
                    updateUserSettings({
                      clans: ev.detail.complete(userSettings.clans),
                    });
                  }
                }}
                disabled={false}>
                {userSettings?.clans.map((clan, clanIndex) => (
                  <IonItem key={clan.clan_id}>
                    <IonReorder slot="start" />
                    <IonAvatar slot="start">
                      <img
                        src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                          clan.clan_id
                        ).toString(36)}.png`}
                      />
                    </IonAvatar>
                    <IonLabel>{clan.name}</IonLabel>
                    <IonButton
                      onClick={() => {
                        updateUserSettings({
                          clans: [
                            ...userSettings.clans.slice(0, clanIndex),
                            ...userSettings.clans.slice(clanIndex + 1),
                          ],
                        });
                      }}
                      color="danger"
                      slot="end">
                      <IonIcon icon={close} />
                    </IonButton>
                  </IonItem>
                ))}
              </IonReorderGroup>
              {!userSettings?.clans.length && (
                <IonCardContent>
                  It's looking a bit empty here. Press the button below to add your first clan!
                </IonCardContent>
              )}
              <IonCardContent className="login-login-buttons">
                <IonButton color="success" onClick={() => setSearchModal("clans")}>
                  <IonIcon icon={shieldOutline} /> Add Clan
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </div>
      </IonContent>
      <Tabs />
    </IonPage>
  );
}

export default Settings;
