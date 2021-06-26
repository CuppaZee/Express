import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";
import stringify from "fast-json-stable-stringify";
import useToken, { useTokenStatus } from "./useToken";
import { useEffect, useRef } from "react";

const getCuppaZeeData = async <D>(
  endpoint: string,
  params: any,
  token: string
): Promise<D> => {
  var response = await fetch(
    "https://server.cuppazee.app/" +
      endpoint?.replace(/{([A-Za-z0-9_]+)}/g, string => {
        return params?.[string[1]] || "";
      }),
    {
      method: "POST",
      body: JSON.stringify({ ...params, access_token: token }),
    }
  );
  
  // TODO: FROM value
  return await response.json();
};

export interface useCuppaZeeDataParams<D> {
  endpoint: string;
  params: any;
  user_id?: number | null;
  options?: UseQueryOptions<D>;
}

export type useCuppaZeeDataResponse<D> = UseQueryResult<D> & {
  tokenStatus: useTokenStatus;
};

export default function useCuppaZeeData<D>(
  params: useCuppaZeeDataParams<D>
): useCuppaZeeDataResponse<D> {
  const [token, tokenStatus, _refetchToken] = useToken(params.user_id);
  const lastToken = useRef<string | null>(null);
  const data = useQuery(
    [params.endpoint, stringify(params.params), params.user_id],
    async () => {
      const responseData = await getCuppaZeeData(params.endpoint, params.params, token ?? "");
      // if (responseData?.status_code === 403) {
      //   refetchToken();
      // }
      return responseData as D;
    },
    {
      ...params.options,
      enabled: !!token && params.options?.enabled,
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
  };
}
