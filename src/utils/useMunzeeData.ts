import { FetchRequest, FetchResponse, Endpoints } from "@cuppazee/api";
import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";
import stringify from "fast-json-stable-stringify";
import useToken, { useTokenStatus } from "./useToken";

const getMunzeeData = async <Path extends keyof Endpoints>(
  endpoint: FetchRequest<Path>["endpoint"],
  params: FetchRequest<Path>["params"] & {httpMethod?: "get"},
  token: string
): Promise<FetchResponse<Path> | null> => {
  var body = new FormData();
  body.append("data", JSON.stringify(params));
  body.append("access_token", token);
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
};

export default function useMunzeeData<Path extends keyof Endpoints>(params: useMunzeeDataParams<Path>): useMunzeeDataResponse<Path> {
  const [token, tokenStatus, refetchToken] = useToken(params.user_id);
  const data = useQuery([params.endpoint, stringify(params.params), token], async () => {
    const responseData = await getMunzeeData(params.endpoint, params.params, token ?? "");
    if (responseData?.status_code === 403) {
      refetchToken();
    }
    return responseData;
  }, {
    ...params.options,
    enabled: !!token && params.options?.enabled,
  })
  return {
    ...data,
    tokenStatus,
  }
}
