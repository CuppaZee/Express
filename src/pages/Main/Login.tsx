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
  useIonToast,
} from "@ionic/react";
import "./Login.css";
import { Plugins } from "@capacitor/core";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import useStorage from "../../utils/useStorage";
import { AccountsStorage } from "../../storage/Account";
import omit from "../../utils/omit";
import { arrowForward, close } from "ionicons/icons";
import { ThemeStorage } from "../../storage/Theme";
import { ReadyStorage } from "../../storage/Ready";
import Header from "../../components/Header";
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
const config = configs.main;
const path = "login";
const redirectUri = !isPlatform("capacitor")
  ? [window.location.origin, path].filter(Boolean).join("/")
  : `app.cuppazee.express://`;

interface LoginParams {
  access_token: string;
}

function Login() {
  const pageTitle = "CuppaZee Express";
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const [present] = useIonToast();
  const [accounts, setAccounts] = useStorage(AccountsStorage);
  const [theme, setTheme] = useStorage(ThemeStorage);
  const [_, setReady] = useStorage(ReadyStorage);
  useEffect(() => {
    if (params.get("access_token")) {
      const [teaken, username, user_id] = decodeURIComponent(params.get("access_token") || "").split("/");
      setAccounts({ ...accounts, [user_id]: { teaken, username, user_id: Number(user_id) } }).then(
        () => history.replace("/login")
      );
    }
  }, [params.get("access_token")]);
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
              <IonCardContent>
                By continuing to use CuppaZee Express, you agree to CuppaZee's Terms of Service and
                Privacy Policy.
              </IonCardContent>
              <IonCardContent className="login-legal-buttons">
                <IonButton>Terms of Service</IonButton>
                <IonButton>Privacy Policy</IonButton>
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Settings</IonCardTitle>
              </IonCardHeader>
              <IonItem>
                <IonLabel>Language</IonLabel>
                <IonSelect value="en-GB">
                  <IonSelectOption value="en-GB">English (UK)</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Theme</IonLabel>
                <IonSelect value={theme.style} onIonChange={ev => setTheme({...theme, style: ev.detail.value })}>
                  <IonSelectOption value="system">System Default</IonSelectOption>
                  <IonSelectOption value="light">Light</IonSelectOption>
                  <IonSelectOption value="dark">Dark</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCard>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Accounts</IonCardTitle>
              </IonCardHeader>
              {Object.entries(accounts).map(([accKey, acc]) => (
                <IonItem key={acc.user_id}>
                  <IonAvatar slot="start">
                    <img
                      src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                        acc.user_id
                      ).toString(36)}.png`}
                    />
                  </IonAvatar>
                  <IonLabel>{acc.username}</IonLabel>
                  <IonButton
                    onClick={() => {
                      setAccounts(omit(accounts, accKey));
                    }}
                    color="danger"
                    slot="end">
                    <IonIcon icon={close} />
                  </IonButton>
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
                    Plugins.OAuth2Client.authenticate({
                      authorizationBaseUrl: "https://api.munzee.com/oauth",
                      resourceUrl: "https://server.cuppazee.app/auth/get/v2",
                      scope: "read",
                      appId: config.client_id,
                      responseType: "token",
                      redirectUrl: config.redirect_uri,
                      state: t.toString(),
                      additionalParameters: {
                        response_type: "code",
                        state: JSON.stringify({
                          redirect: redirectUri,
                          platform: isPlatform("android")
                            ? "android"
                            : isPlatform("ios")
                            ? "ios"
                            : "web",
                          ionic: t.toString(),
                        }),
                      },
                    })
                      .then((response: any) => {
                        const [teaken, username, user_id] = decodeURIComponent(
                          response.data.access_token
                        ).split("/");
                        setAccounts({
                          ...accounts,
                          [user_id]: { teaken, username, user_id: Number(user_id) },
                        });
                        present({
                          duration: 2000,
                          color: "success",
                          message: `Successfully logged in as ${username}`,
                        });
                      })
                      .catch((reason: any) => {
                        if (reason?.message !== "USER_CANCELLED") {
                          present({
                            duration: 2000,
                            color: "danger",
                            message: "Oops, something went wrong when logging in.",
                          });
                        }
                      });
                  }}>
                  Login with Munzee
                </IonButton>
              </IonCardContent>
            </IonCard>
            {Object.keys(accounts).length === 0 && (
              <IonText className="login-continue-message">
                You must log into an account to continue
              </IonText>
            )}
            <IonButton
              className="login-continue"
              disabled={Object.keys(accounts).length === 0}
              color="primary"
              onClick={() => {
                setReady({ date: "2021-05-18" });
              }}>
              Continue <IonIcon icon={arrowForward} />
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Login;
