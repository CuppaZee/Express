import { IonButton } from "@ionic/react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  useCuppaZeeDataError,
  useCuppaZeeDataErrorType,
  useCuppaZeeDataResponse,
} from "../utils/useCuppaZeeData";
import useLogin from "../utils/useLogin";
import { useMunzeeDataResponse } from "../utils/useMunzeeData";
import { useTokenStatus } from "../utils/useToken";
import "./CZError.css";

function LoginError({ children }: { children: (login: () => void) => React.ReactElement }) {
  const login = useLogin();
  return children(login);
}

export interface useErrorResponseButton {
  label: string;
  action?(): void;
  login?: boolean;
}

export interface useErrorResponse {
  title: string;
  description: string;
  buttons?: useErrorResponseButton[];
}

export default function useError(
  data: (useMunzeeDataResponse<any> | useCuppaZeeDataResponse<any>)[]
): useErrorResponse | null {
  const { t } = useTranslation();
  const failed = data.find(i => i.tokenStatus === useTokenStatus.Failed);
  if (failed) {
    return {
      title: `Something went wrong trying to log you into CuppaZee.`,
      description: "Please try again later.",
    };
  }
  const missingAll =
    data.find(
      i =>
        (i.error as useCuppaZeeDataError)?.type === useCuppaZeeDataErrorType.Failure &&
        (i.error as useCuppaZeeDataError)?.data?.error_message === "missing_login"
    );
  if (missingAll) {
    return {
      title: "This user hasn't logged into CuppaZee.",
      description: "Please log in to continue.",
      buttons: [{ label: "Login with Munzee", login: true }],
    };
  }
  const missing =
    data.find(i => i.tokenStatus === useTokenStatus.Missing)
  if (missing) {
    return {
      title: "This user hasn't logged in on this device.",
      description: "Please log in to continue.",
      buttons: [{ label: "Login with Munzee", login: true }],
    };
  }
  const expired = data.find(i => i.tokenStatus === useTokenStatus.Expired);
  if (expired) {
    const username =
      expired.tokenDetails.account?.username ??
      (expired.tokenDetails.user_id ? expired.tokenDetails.user_id : undefined);
    return {
      title: `${username ?? "You"} ${username ? "needs" : "need"} to re-authenticated.`,
      description: "Please log in to continue.",
      buttons: [{ label: "Login with Munzee", login: true }],
    };
  }
  const errored = data.filter(i => i.error);
  if (errored.length > 0) {
    return {
      title: `Something went wrong.`,
      description: "Please try again later.",
    };
  }
  return null;
}

function LoginButton({ children }: { children: string }) {
  const login = useLogin();
  return (
    <IonButton style={{ margin: 4 }} onClick={() => login()}>
      {children}
    </IonButton>
  );
}

export function CZError(error: useErrorResponse) {
  return (
    <div className="czerror-wrapper">
      <h4>{error.title}</h4>
      <h6>{error.description}</h6>
      {!!error.buttons && (
        <div className="czerror-buttons">
          {error.buttons.map(i => (
            <div>
              {i.login ? (
                <LoginButton>{i.label}</LoginButton>
              ) : (
                <IonButton style={{ margin: 4 }} onClick={() => i.action?.()}>
                  {i.label}
                </IonButton>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
