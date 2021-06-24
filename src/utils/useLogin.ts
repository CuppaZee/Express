import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { isPlatform, useIonRouter, useIonToast } from "@ionic/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { AccountsStorage } from "../storage/Account";
import blankAnimation from "./blankAnimation";
import useStorage from "./useStorage";
import useUserSettings, { UserSettingsUser, useUserSettingsMutation } from "./useUserSettings";

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

export default function useLogin() {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useIonRouter();
  const params = new URLSearchParams(location.search);
  const [present] = useIonToast();
  const [accounts, setAccounts] = useStorage(AccountsStorage);
  const config = configs.main;
  const redirectUri = !isPlatform("capacitor")
    ? [window.location.origin, window.location.pathname.slice(1)].filter(Boolean).join("/")
    : `app.cuppazee.express://more`;
  const userSettings = useUserSettings();
  const updateUserSettings = useUserSettingsMutation();
  const [queuedAccounts, setQueuedAccounts] = useState<UserSettingsUser[]>([]);

  function handleNewUser(access_token: string) {
    const [teaken, username, user_id] = decodeURIComponent(access_token || "").split("/");
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
      message: t("settings:accounts_success", { player: username }),
    });
    setQueuedAccounts(i => [
      ...i,
      {
        username,
        user_id: Number(user_id),
      },
    ]);
  }

  useEffect(() => {
    if (params.get("access_token")) {
      handleNewUser(params.get("access_token") ?? "");
    }
  }, [params.get("access_token")]);
  useEffect(() => {
    const r = App.addListener("appUrlOpen", async o => {
      try {
        await Browser.close();
      } catch (e) {}
      const params = new URL(o.url).searchParams;
      if (params.has("access_token")) {
        handleNewUser(params.get("access_token") ?? "");
      }
    });
    return () => {
      r.then(i => i.remove());
    };
  }, [accounts]);

  useEffect(() => {
    if (queuedAccounts.length > 0 && userSettings?.users) {
      const users = userSettings.users.slice();
      for (const account of queuedAccounts) {
        if (!users.find(i => i.user_id === account.user_id)) {
          users.push(account);
        }
      }
      if (users.length !== userSettings.users.length) {
        updateUserSettings({ users });
      }
      setQueuedAccounts([]);
    }
  }, [queuedAccounts, userSettings]);

  return async () => {
    const t = Math.floor(Math.random() * 10000) + 1;
    const url = `https://api.munzee.com/oauth?client_id=${
      config.client_id
    }&redirect_uri=${encodeURIComponent(
      config.redirect_uri
    )}&scope=read&response_type=code&state=${encodeURIComponent(
      JSON.stringify({
        redirect: redirectUri,
        platform: isPlatform("android") ? "android" : isPlatform("ios") ? "ios" : "web",
        ionic: t.toString(),
      })
    )}`;
    if (!isPlatform("capacitor")) {
      window.location.href = url;
      return;
    }
    await Browser.open({
      url: url,
      presentationStyle: "popover",
    });
  };
}
