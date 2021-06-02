import { Route } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import UserMainPage from "./pages/User/Main";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

import "./App.css";
import { useEffect, useRef, useState } from "react";

import { registerWebPlugin } from "@capacitor/core";
import { OAuth2Client } from "@byteowls/capacitor-oauth2";
import Login from "./pages/Main/Login";

import { QueryClient, QueryClientProvider } from "react-query";
import { Provider as JotaiProvider } from "jotai";
import useStorage from "./utils/useStorage";
import { ThemeStorage } from "./storage/Theme";
import { ReadyStorage } from "./storage/Ready";
import { AccountsStorage } from "./storage/Account";

import "./utils/dayjs";
import Search from "./pages/Main/Search";
import UserActivityPage from "./pages/User/Activity";
import UserInventoryPage from "./pages/User/Inventory";
import ClanStatsPage from "./pages/Clan/Stats";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000,
    },
  },
});

const ThemeHandler: React.FC = () => {
  const [theme] = useStorage(ThemeStorage);
  useEffect(() => {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    toggleDarkTheme(prefersDark);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener("change", toggleDarkTheme);

    // Add or remove the "dark" class based on if the media query matches
    function toggleDarkTheme(prefersDark: MediaQueryList | MediaQueryListEvent) {
      const colSch = document.getElementById("COLORSCHEME") as any;
      if (theme.style === "system") {
        document.body.classList.toggle("dark", prefersDark.matches);
        if (colSch) colSch.content = "light dark";
      } else {
        document.body.classList.toggle("dark", theme.style === "dark");
        if (colSch) colSch.content = theme.style === "dark" ? "dark" : "light";
      }
    }

    return () => prefersDark.removeEventListener("change", toggleDarkTheme);
  }, [theme]);
  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    registerWebPlugin(OAuth2Client);
  }, []);
  const [ready, _1, readyLoaded] = useStorage(ReadyStorage);
  const [accounts, _2, accountsLoaded] = useStorage(AccountsStorage);
  useEffect(() => {
    if (accountsLoaded && window.location.pathname === "/") {
      window.location.pathname = `/user/${Object.values(accounts)[0]?.username}`;
    }
  }, [accountsLoaded]);
  return (
    <IonApp>
      <IonReactRouter>
        <ThemeHandler />
        {!readyLoaded || !accountsLoaded ? null : ready.date === "2021-05-18" ? (
          <IonRouterOutlet>
            <Route exact path="/search" component={Search} />
            <Route exact path="/more" component={Login} />
            <Route exact path="/clan/:id" component={ClanStatsPage} />
            <Route exact path="/user/:username" component={UserMainPage} />
            <Route exact path="/user/:username/activity" component={UserActivityPage} />
            <Route exact path="/user/:username/activity/:date" component={UserActivityPage} />
            <Route exact path="/user/:username/inventory" component={UserInventoryPage} />
            <Route
              render={() => {
                return null;
              }}
            />
          </IonRouterOutlet>
        ) : (
          <Login />
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <App />
      </JotaiProvider>
    </QueryClientProvider>
  );
}
