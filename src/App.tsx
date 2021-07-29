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
import Settings from "./pages/More/Settings";
import Credits from "./pages/More/Credits";
import Sidebar from "./components/Sidebar";
import { setupConfig } from "@ionic/core";
import platform from "platform";
import useWindowSize from "./utils/useWindowSize";
import UserClanProgressPage from "./pages/User/Clan";
import ClanRequirementsPage from "./pages/Clan/Requirements";
import { SiriShortcuts } from "capacitor-plugin-siri-shorts";
import blankAnimation from "./utils/blankAnimation";
import More from "./pages/More/More";
import useUserSettings from "./utils/useUserSettings";
import AndroidWidgetConfigurePage from "./pages/More/AndroidWidgetConfigure";

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
      try {
        client.clientState.queries.forEach(query => {
          query.state.isFetching = false;
        })
        return await (await store).set("@czexpress/querycache", JSON.stringify(client));
      } catch {
        return await(await store).set("@czexpress/querycache", JSON.stringify(client));
      }
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

export function URLHandler() {
  const router = useIonRouter();
  useEffect(() => {
    const r = CapApp.addListener("appUrlOpen", async o => {
      console.log('CZ', o.url);
      if (!o.url.includes("access_token")) {
        router.push("/" + o.url.split("://").slice(1).join("://"));
      }
    });
    return () => {
      r.then(i => i.remove());
    };
  }, []);
  return null;
}


export function pickTextColor(
  bgColor: string,
  lightColor: string = "#fff",
  darkColor: string = "#000"
) {
  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map(col => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? darkColor : lightColor;
}

function ClanStyleHandler() {
  const userSettings = useUserSettings();
  return <style>
    {`:root {${Object.entries(userSettings?.colours ?? {}).map(([key, value]) => {
        try {
          const contrasted = pickTextColor(value || "#ff5500")
          return `--${key}: ${value};--${key}-fg: ${contrasted};`;
        } catch (e) {
          return `--${key}: ${value};--${key}-fg: #000000;`;
        }
      }).join("")}}`}
  </style>
}

const App: React.FC = () => {
  const [ready, _1, readyLoaded] = useStorage(ReadyStorage);
  const [accounts, _2, accountsLoaded] = useStorage(AccountsStorage);
  const {width} = useWindowSize();
  return (
    <GlobalErrorBoundary>
      <IonApp>
        <IonReactRouter>
          <ThemeHandler />
          <BackHandler />
          <SiriHandler />
          <URLHandler />
          <ClanStyleHandler />
          {!readyLoaded || !accountsLoaded ? null : ready.date === "2021-06-18" &&
            Object.values(accounts).some(i => i.primary) ? (
            <IonSplitPane when={width > 900} contentId="ion-router-outlet">
              <Sidebar />
              <div id="ion-router-outlet">
                <IonRouterOutlet>
                  <Route
                    exact
                    path="/widget_configure_activity_widget/:id"
                    component={AndroidWidgetConfigurePage}
                  />
                  <Route exact path="/search" component={Search} />
                  <Route exact path="/more/credits" component={Credits} />
                  <Route exact path="/more/settings" component={Settings} />
                  <Route exact path="/more" component={More} />
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
