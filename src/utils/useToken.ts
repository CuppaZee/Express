import { useQuery } from "react-query";
import { AccountsStorage } from "../storage/Account";
import useStorage from "./useStorage";

type useTokenResponse = [token: string | null, status: useTokenStatus, refresh: () => void];
export enum useTokenStatus {
  Success = "success",
  Loading = "loading",
  Expired = "expired",
  Missing = "missing"
}

export interface AccessToken {
  access_token: string;
  expires: number;
  expires_in: number;
  token_type: "Bearer";
}

const baseURL = 'https://server.cuppazee.app'

const getToken = async (teaken: string, user_id: number): Promise<{data: AccessToken}> => {
  const response = await fetch(
    `${baseURL}/auth/get/v2?teaken=${encodeURIComponent(teaken)}&user_id=${encodeURIComponent(
      user_id
    )}`
  );
  if (!response.ok) {
    throw new Error("Expired");
  }
  // TODO: FROM value
  return await response.json();
};

export default function useToken(user_id?: number | null): useTokenResponse {
  const [accounts] = useStorage(AccountsStorage);
  const account =
    user_id === null ? undefined : (accounts[user_id ?? Object.keys(accounts)[0]] ?? accounts["*"]);
  const data = useQuery(
    ["token", account?.teaken, Number(user_id ?? Object.keys(accounts)[0])],
    () => (account?.teaken ? getToken(account?.teaken, Number(user_id ?? Object.keys(accounts)[0])) : null),
    {
      enabled: account?.teaken !== undefined,
    }
  );
  if (!account) {
    return [null, useTokenStatus.Missing, () => {}];
  } else if (data.isSuccess && data?.data?.data?.access_token) {
    return [data.data.data.access_token, useTokenStatus.Success, data.refetch];
  } else if (data.isSuccess && !data?.data?.data?.access_token) {
    return [null, useTokenStatus.Expired, data.refetch];
  } else if (data.isError) {
    return [null, useTokenStatus.Expired, data.refetch];
  }
  return [null, useTokenStatus.Loading, data.refetch];
}
