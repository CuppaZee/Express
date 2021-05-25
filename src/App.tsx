import { Route, Switch } from "react-router-dom";
import {
  IonApp,
  IonAvatar,
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { grid, search } from "ionicons/icons";
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

import "./App.css"
import { useEffect } from "react";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000
    }
  }
});

const App: React.FC = () => {
  useEffect(() => {
    registerWebPlugin(OAuth2Client);
  }, []);
  const [theme] = useStorage(ThemeStorage);
  const [ready] = useStorage(ReadyStorage);
  const [accounts] = useStorage(AccountsStorage);
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
  return (
    <IonApp>
      <IonReactRouter>
        {ready.date === "2021-05-18" ? (
          <IonPage>
            <Switch>
              <Route exact path="/user/:username">
                <UserMainPage />
              </Route>
              <Route exact path="/tools">
                Tools
              </Route>
              <Route exact path="/search">
                <Search />
              </Route>
              <Route path="/">Home</Route>
            </Switch>
            <IonTabBar>
              <IonTabButton tab="search" href="/search">
                <IonIcon icon={search} />
                <IonLabel>Search</IonLabel>
              </IonTabButton>
              {Object.values(accounts).map(acc => (
                <IonTabButton key={acc.username} tab={`user/${acc.username}`} href={`/user/${acc.username}`}>
                  <IonIcon style={{ display: "none" }} />
                  <IonAvatar className="tab-icon-avatar">
                    <img
                      src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                        acc.user_id
                      ).toString(36)}.png`}
                    />
                  </IonAvatar>
                  <IonLabel>{acc.username}</IonLabel>
                </IonTabButton>
              ))}
              <IonTabButton tab="tools" href={`/tools`}>
                <IonIcon icon={grid} />
                <IonLabel>More</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonPage>
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
