import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, IonSplitPane, isPlatform } from "@ionic/react";
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
import { Component, useEffect } from "react";

import Login from "./pages/Main/Login";

import { QueryClient, QueryClientProvider } from "react-query";
import { Provider as JotaiProvider } from "jotai";
import useStorage, { store } from "./utils/useStorage";
import { ThemeStorage } from "./storage/Theme";
import { ReadyStorage } from "./storage/Ready";
import { AccountsStorage } from "./storage/Account";

import "./utils/dayjs";

import { useIonRouter } from "@ionic/react";
import { App as CapApp } from "@capacitor/app";

import { FirebaseCrashlytics } from "@capacitor-community/firebase-crashlytics";
import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";

import "./lang/i18n";
import { Capacitor } from "@capacitor/core";

import { persistQueryClient } from "react-query/persistQueryClient-experimental";

import Search from "./pages/Main/Search";
import UserActivityPage from "./pages/User/Activity";
import UserInventoryPage from "./pages/User/Inventory";
import UserQRatesPage from "./pages/User/QRates";
import UserCapturesPage from "./pages/User/Captures";
import UsersPage from "./pages/User/All";
import ClanAllPage from "./pages/Clan/All";
import ClanStatsPage from "./pages/Clan/Stats";
import Settings from "./pages/Main/Settings";
import Sidebar from "./components/Sidebar";
import { setupConfig } from "@ionic/core";
import platform from "platform";
import useWindowSize from "./utils/useWindowSize";
import UserClanProgressPage from "./pages/User/Clan";
import ClanRequirementsPage from "./pages/Clan/Requirements";
import { SiriShortcuts } from "capacitor-plugin-siri-shorts";
import blankAnimation from "./utils/blankAnimation";

if (!Capacitor.isNativePlatform()) {
  FirebaseAnalytics.initializeFirebase({
    apiKey: "AIzaSyA6J5hg1-l3WmUIlIHG7MyRInCEOq8PILQ",
    authDomain: "cuppazee-app.firebaseapp.com",
    databaseURL: "https://cuppazee-app.firebaseio.com",
    projectId: "cuppazee-app",
    storageBucket: "cuppazee-app.appspot.com",
    messagingSenderId: "540446857818",
    appId: "1:540446857818:web:af2e055d760aeed4885663",
    measurementId: "G-NW7WX4Z8Z1",
  });
}

if (platform.os?.family === "OS X" || platform.os?.family === "iOS") {
  setupConfig({
    rippleEffect: false,
    mode: "ios",
  });
} else {
  setupConfig({
    rippleEffect: true,
    mode: "md",
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000,
    },
  },
});

persistQueryClient({
  queryClient,
  persistor: {
    async persistClient(client) {
      return await (await store).set("@czexpress/querycache", JSON.stringify(client));
    },
    async restoreClient() {
      return JSON.parse((await (await store).get("@czexpress/querycache")) ?? "null");
    },
    async removeClient() {
      return await (await store).remove("@czexpress/querycache");
    },
  },
});

class GlobalErrorBoundary extends Component<{}, { hasError: boolean; error?: string }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error: `${error.name}\n${error.message}\n${error.stack}\nInfo:\nN/A`,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // You can also log the error to an error reporting service
    this.setState({
      ...this.state,
      error: `${error.name}\n${error.message}\n${error.stack}\nInfo:\n${JSON.stringify(errorInfo)}`,
    });
    if (Capacitor.isNativePlatform()) {
      FirebaseCrashlytics.recordException({
        message: `${error.name}\n${error.message}\n${error.stack}\nInfo:\n${JSON.stringify(
          errorInfo
        )}`,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>
            Something went wrong.{" "}
            {Capacitor.isNativePlatform()
              ? "This error has been reported:"
              : "Please report the following error:"}
          </h1>
          <pre>
            <code>{this.state.error}</code>
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const BackHandler: React.FC = () => {
  const ionRouter = useIonRouter();
  useEffect(() => {
    CapApp.addListener("backButton", ev => {
      if (!ionRouter.canGoBack()) {
        CapApp.exitApp();
      }
    });
  }, []);
  return null;
};

const SiriHandler: React.FC = () => {
  const ionRouter = useIonRouter();
  useEffect(() => {
    if (isPlatform("ios") && Capacitor.isNativePlatform()) {
      SiriShortcuts.donate({
        persistentIdentifier: "clanStats",
        title: "Open Clan Stats",
        suggestedInvocationPhrase: "Open Clan Stats"
      });
      SiriShortcuts.addListener("appLaunchBySiriShortcuts", res => {
        let page: string | null = null;
        switch (res.persistentIdentifier) {
          case "clanStats":
            page = "/clans";
            break;
        }
        if (page) {
          ionRouter.push(page, undefined, "replace", undefined, blankAnimation);
        }
      });
      return () => { SiriShortcuts.removeAllListeners() }
    }
  }, []);
  return null;
};

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
  const [ready, _1, readyLoaded] = useStorage(ReadyStorage);
  const [accounts, _2, accountsLoaded] = useStorage(AccountsStorage);
  const screen = useWindowSize();
  return (
    <GlobalErrorBoundary>
      <IonApp>
        <IonReactRouter>
          <ThemeHandler />
          <BackHandler />
          <SiriHandler />
          {!readyLoaded || !accountsLoaded ? null : ready.date === "2021-06-18" &&
            Object.values(accounts).some(i => i.primary) ? (
            <IonSplitPane when={(screen?.width ?? 0) > 900} contentId="ion-router-outlet">
              <Sidebar />
              <div id="ion-router-outlet">
                <IonRouterOutlet>
                  <Route exact path="/search" component={Search} />
                  <Route exact path="/more" component={Settings} />
                  <Route exact path="/clans" component={ClanAllPage} />
                  <Route exact path="/clans/:month/:year" component={ClanAllPage} />
                  <Route exact path="/clans/requirements" component={ClanRequirementsPage} />
                  <Route
                    exact
                    path="/clans/requirements/:month/:year"
                    component={ClanRequirementsPage}
                  />
                  <Route exact path="/clan/:id" component={ClanStatsPage} />
                  <Route exact path="/clan/:id/:month/:year" component={ClanStatsPage} />
                  <Route exact path="/players" component={UsersPage} />
                  <Route exact path="/player/:username" component={UserMainPage} />
                  <Route exact path="/player/:username/qrates" component={UserQRatesPage} />
                  <Route exact path="/player/:username/activity" component={UserActivityPage} />
                  <Route exact path="/player/:username/clan" component={UserClanProgressPage} />
                  <Route
                    exact
                    path="/player/:username/activity/:date"
                    component={UserActivityPage}
                  />
                  <Route exact path="/player/:username/inventory" component={UserInventoryPage} />
                  <Route
                    exact
                    path="/player/:username/captures/:type"
                    component={UserCapturesPage}
                  />
                  <Redirect
                    exact
                    path="/"
                    to={`/player/${Object.values(accounts).find(i => i.primary)?.username}`}
                  />
                  <Route
                    render={() => {
                      return null;
                    }}
                  />
                </IonRouterOutlet>
              </div>
            </IonSplitPane>
          ) : (
            <Login />
          )}
        </IonReactRouter>
      </IonApp>
    </GlobalErrorBoundary>
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
