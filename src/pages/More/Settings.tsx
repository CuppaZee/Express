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
  IonReorderGroup,
  IonReorder,
  useIonAlert,
} from "@ionic/react";
import "./Settings.css";
import { useEffect, useState } from "react";
import AppIcon from "../Main/AppIcon";
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
import { LANGS } from "../../lang/i18n";
import { useTranslation } from "react-i18next";
import Tabs from "../../components/Tabs";
import useUserSettings, {
  useCloudUserSettings,
  useRootCategories,
  useUserSettingsMutation,
} from "../../utils/useUserSettings";
import SearchModal from "../../components/Search/User";
import CZRefresher from "../../components/CZRefresher";
import { LocalSettingsStorage } from "../../storage/LocalSettings";
import useLogin from "../../utils/useLogin";
import { AlertOptions } from "@ionic/core";
import { TFunction } from "i18next";
import useDB from "../../utils/useDB";
import { CZTypeImg } from "../../components/CZImg";

function confirmSyncEnable(
  t: TFunction,
  present: (options: AlertOptions) => void,
  section: string,
  onYes: () => void
) {
  present({
    header: t("settings:sync_enable_title", {
      section,
    }),
    message: t("settings:sync_enable_desc", {
      section,
    }),
    buttons: [
      t("settings:sync_cancel"),
      {
        text: t("settings:sync_enable"),
        handler: onYes,
      },
    ],
  });
}
function confirmSyncDisable(
  t: TFunction,
  present: (options: AlertOptions) => void,
  section: string,
  onYes: () => void
) {
  present({
    header: t("settings:sync_disable_title", {
      section,
    }),
    message: t("settings:sync_disable_desc", {
      section,
    }),
    buttons: [
      t("settings:sync_cancel"),
      {
        text: t("settings:sync_disable"),
        handler: onYes,
      },
    ],
  });
}

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
  const [presentAlert] = useIonAlert();
  const [accounts, setAccounts] = useStorage(AccountsStorage);
  const [theme, setTheme] = useStorage(ThemeStorage);
  const [_, setReady] = useStorage(ReadyStorage);
  const [searchModal, setSearchModal] = useState<"players" | "clans" | null>(null);
  const userSettings = useUserSettings();
  const rootCategories = useRootCategories();
  const [localSettings, setLocalSettings] = useStorage(LocalSettingsStorage);
  const cloudUserSettings = useCloudUserSettings();
  const updateUserSettings = useUserSettingsMutation();
  const login = useLogin();
  const db = useDB();
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
            <IonCard data-section="personalisation">
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
            <IonCard data-section="accounts">
              <IonItem lines="none" className="item-card-header">
                <IonCardTitle>{t("welcome:accounts")}</IonCardTitle>

                {Object.entries(accounts).length > 0 && (
                  <IonButton
                    onClick={() => {
                      presentAlert({
                        header: `Sign out?`,
                        message: `Are you sure you want to sign out of CuppaZee?`,
                        buttons: [
                          "Cancel",
                          {
                            text: "Remove",
                            handler: () => {
                              setReady({ date: "" });
                              setAccounts({});
                            },
                          },
                        ],
                      });
                    }}
                    color="danger"
                    slot="end">
                    {t("settings:accounts_signout")}
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
                          presentAlert({
                            header: `Log out of ${acc.username}?`,
                            message: `Are you sure you want to log out ${acc.username} and remove them from Players?`,
                            buttons: [
                              "Cancel",
                              {
                                text: "Log out",
                                handler: () => {
                                  updateUserSettings({
                                    users: userSettings?.users.filter(
                                      i => i.user_id !== acc.user_id
                                    ),
                                  });
                                  setAccounts(omit(accounts, accKey));
                                },
                              },
                            ],
                          });
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
                  onClick={() => {
                    login();
                  }}>
                  <IonIcon icon={lockOpenOutline} /> {t("settings:accounts_add")}
                </IonButton>
              </IonCardContent>
            </IonCard>
            <IonCard data-section="players">
              <IonItem lines="none" className="item-card-header">
                <IonCardTitle>{t("settings:players_title")}</IonCardTitle>
                {localSettings.users ? (
                  <IonButton
                    onClick={() => {
                      confirmSyncEnable(t, presentAlert, t("settings:players_title"), () => {
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
                      });
                    }}
                    color="success"
                    slot="end">
                    <IonIcon icon={cloud} />
                    &nbsp;
                    {t("settings:sync_enable")}
                  </IonButton>
                ) : (
                  <IonButton
                    onClick={() => {
                      confirmSyncDisable(t, presentAlert, t("settings:players_title"), () => {
                        setLocalSettings({ ...localSettings, users: userSettings?.users });
                      });
                    }}
                    color="danger"
                    slot="end">
                    <IonIcon icon={cloudOffline} />
                    &nbsp;{t("settings:sync_disable")}
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
                    {!accounts[user.user_id]?.primary && (
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
                    )}
                  </IonItem>
                ))}
              </IonReorderGroup>
              {!userSettings?.users.length && (
                <IonCardContent>{t("settings:players_empty")}</IonCardContent>
              )}
              <IonCardContent className="login-login-buttons">
                <IonButton color="success" onClick={() => setSearchModal("players")}>
                  <IonIcon icon={personOutline} /> {t("settings:players_add")}
                </IonButton>
              </IonCardContent>
            </IonCard>
            <IonCard data-section="clans">
              <IonItem lines="none" className="item-card-header">
                <IonCardTitle>{t("settings:clans_title")}</IonCardTitle>
                {localSettings.clans ? (
                  <IonButton
                    onClick={() => {
                      confirmSyncEnable(t, presentAlert, t("settings:clans_title"), () => {
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
                      confirmSyncDisable(t, presentAlert, t("settings:clans_title"), () => {
                        setLocalSettings({ ...localSettings, clans: userSettings?.clans });
                      });
                    }}
                    color="danger"
                    slot="end">
                    <IonIcon icon={cloudOffline} />
                    &nbsp;{t("settings:sync_disable")}
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
              <IonCardContent className="login-login-buttons">
                <IonButton color="success" onClick={() => setSearchModal("clans")}>
                  <IonIcon icon={shieldOutline} /> {t("settings:clans_add")}
                </IonButton>
              </IonCardContent>
            </IonCard>
            <IonCard data-section="typecategories">
              <IonItem lines="none" className="item-card-header">
                <IonCardTitle>Type Categories</IonCardTitle>
                {localSettings.rootCategories ? (
                  <IonButton
                    onClick={() => {
                      confirmSyncEnable(t, presentAlert, "Type Categories", () => {
                        setLocalSettings(omit(localSettings, "rootCategories"));
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
                      confirmSyncDisable(t, presentAlert, "Type Categories", () => {
                        setLocalSettings({
                          ...localSettings,
                          rootCategories: userSettings?.rootCategories,
                        });
                      });
                    }}
                    color="danger"
                    slot="end">
                    <IonIcon icon={cloudOffline} />
                    &nbsp;{t("settings:sync_disable")}
                  </IonButton>
                )}
              </IonItem>
              <IonReorderGroup
                onIonItemReorder={ev => {
                  if (userSettings) {
                    updateUserSettings({
                      rootCategories: ev.detail.complete(rootCategories),
                    });
                  }
                }}
                disabled={false}>
                {rootCategories.map((category, categoryIndex) => {
                  const c = db.getCategory(category);
                  if (!c) return null;
                  return (
                    <IonItem key={category}>
                      <IonReorder slot="start" />
                      <CZTypeImg className="item-avatar" slot="start" img={c.icon} />
                      <IonLabel>{c.name}</IonLabel>
                      <IonButton
                        onClick={() => {
                          updateUserSettings({
                            rootCategories: [
                              ...rootCategories.slice(0, categoryIndex),
                              ...rootCategories.slice(categoryIndex + 1),
                            ],
                          });
                        }}
                        color="danger"
                        slot="end">
                        <IonIcon icon={close} />
                      </IonButton>
                    </IonItem>
                  );
                })}
              </IonReorderGroup>
            </IonCard>
          </div>
        </div>
      </IonContent>
      <Tabs />
    </IonPage>
  );
}

export default Settings;
