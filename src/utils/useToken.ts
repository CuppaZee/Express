import { useQuery } from "react-query";
import { Account, AccountsStorage } from "../storage/Account";
import useStorage from "./useStorage";

type useTokenResponse = [token: string | null, status: useTokenStatus, refresh: () => void, tokenDetails: useTokenDetails];
export enum useTokenStatus {
  Success = "success",
  Loading = "loading",
  Expired = "expired",
  Missing = "missing",
  Failed = "failed",
}

export interface useTokenDetails {
  account?: Account;
  user_id?: number | null;
}

export interface AccessToken {
  access_token: string;
  expires: number;
  expires_in: number;
  token_type: "Bearer";
}

const baseURL = 'https://server.cuppazee.app'

const getToken = async (teaken: string, user_id: number): Promise<{ data: AccessToken }> => {
  const response = await fetch(
    `${baseURL}/auth/get/v2?teaken=${encodeURIComponent(teaken)}&user_id=${encodeURIComponent(
      user_id
    )}`
  );
  // TODO: FROM value
  return await response.json();
};

export default function useToken(user_id?: number | null): useTokenResponse {
  const [accounts] = useStorage(AccountsStorage);
  const primaryAccount = Object.values(accounts).find(i => i.primary);
  const account =
    user_id === null
      ? undefined
      : accounts[user_id ?? primaryAccount?.user_id ?? 0] ?? accounts["*"];
  const data = useQuery(
    ["token", account?.teaken, Number(user_id ?? primaryAccount?.user_id)],
    () =>
      account?.teaken
        ? getToken(account?.teaken, Number(user_id ?? primaryAccount?.user_id))
        : null,
    {
      enabled: account?.teaken !== undefined,
    }
  );
  const tokenDetails: useTokenDetails = {
    account,
    user_id,
  };
  if (!account) {
    return [null, useTokenStatus.Missing, () => {}, tokenDetails];
  } else if (data.isSuccess && data?.data?.data?.access_token) {
    return [data.data.data.access_token, useTokenStatus.Success, data.refetch, tokenDetails];
  } else if (data.isSuccess && !data?.data?.data?.access_token) {
    return [null, useTokenStatus.Expired, data.refetch, tokenDetails];
  } else if (data.isError) {
    return [null, useTokenStatus.Failed, data.refetch, tokenDetails];
  }
  return [null, useTokenStatus.Loading, data.refetch, tokenDetails];
}
