import { FetchRequest, FetchResponse, Endpoints } from "@cuppazee/api";
import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";
import stringify from "fast-json-stable-stringify";
import useToken, { useTokenDetails, useTokenStatus } from "./useToken";
import { IonToast } from "@ionic/react";
import { useEffect, useRef } from "react";

const getMunzeeData = async <Path extends keyof Endpoints>(
  endpoint: FetchRequest<Path>["endpoint"],
  params: FetchRequest<Path>["params"] & {httpMethod?: "get"},
  token: string
): Promise<FetchResponse<Path> | null> => {
  const start = performance.now();
  var body = new FormData();
  body.append("data", JSON.stringify(params));
  body.append("access_token", token);
  const mid = performance.now();
  var response = await fetch(
    "https://api.munzee.com/" +
      endpoint?.replace(/{([A-Za-z0-9_]+)}/g, string => {
        return params?.[string[1] as keyof FetchRequest<Path>["params"]] || "";
      }) +
      (params.httpMethod === "get" ? `?access_token=${encodeURIComponent(token)}` : ""),
    {
      method: params.httpMethod === "get" ? "GET" : "POST",
      body: params.httpMethod === "get" ? undefined : body,
    }
  );
  // alert(
  //   `Done getting data: ${endpoint}, ${mid - start}ms + ${performance.now() - mid}ms = ${performance.now() - start}ms`
  // );
  // TODO: FROM value
  return await response.json();
};

export interface useMunzeeDataParams<Path extends keyof Endpoints> {
  endpoint: FetchRequest<Path>["endpoint"];
  params: FetchRequest<Path>["params"] & { httpMethod?: "get" };
  user_id?: number | null;
  options?: UseQueryOptions<Endpoints[Path]["response"] | null>;
}

export type useMunzeeDataResponse<Path extends keyof Endpoints> = UseQueryResult<Endpoints[Path]["response"] | null> & {
  tokenStatus: useTokenStatus;
  tokenDetails: useTokenDetails;
};

export default function useMunzeeData<Path extends keyof Endpoints>(params: useMunzeeDataParams<Path>): useMunzeeDataResponse<Path> {
  const [token, tokenStatus, refetchToken, tokenDetails] = useToken(params.user_id);
  const lastToken = useRef<string | null>(null);
  const data = useQuery(
    [params.endpoint, stringify(params.params), params.user_id],
    async () => {
      const responseData = await getMunzeeData(params.endpoint, params.params, token ?? "");
      if (responseData?.status_code === 403) {
        refetchToken();
      }
      return responseData;
    },
    {
      ...params.options,
      enabled: !!token && params.options?.enabled !== false,
    }
  );
  useEffect(() => {
    if (token !== lastToken.current && lastToken.current) {
      data.refetch();
    }
    lastToken.current = token;
  }, [token]);
  return {
    ...data,
    tokenStatus,
    tokenDetails,
  }
}
