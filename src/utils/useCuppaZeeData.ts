import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";
import stringify from "fast-json-stable-stringify";
import useToken, { useTokenDetails, useTokenStatus } from "./useToken";
import { useEffect, useRef } from "react";

const getCuppaZeeData = async <D>(
  endpoint: string,
  params: any,
  token: string
): Promise<D> => {
  try {
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
  } catch (e) {
    const error: useCuppaZeeDataError = {
      type: useCuppaZeeDataErrorType.ConnectionFailed,
      error: e,
    }
    throw error;
  }
  
  // TODO: FROM value
  let data;
  try {
    data = await response.json();
  } catch (e) {
    const error: useCuppaZeeDataError = {
      type: useCuppaZeeDataErrorType.ConnectionFailed,
      error: e,
    };
    throw error;
  }
  if (!response.ok) {
    const error: useCuppaZeeDataError = {
      type: useCuppaZeeDataErrorType.Failure,
      data,
    };
    throw error;
  }
  return data;
};

export enum useCuppaZeeDataErrorType {
  ConnectionFailed,
  InvalidResponse,
  Failure,
}

export interface useCuppaZeeDataError {
  type: useCuppaZeeDataErrorType;
  error?: Error;
  data?: any;
}

export interface useCuppaZeeDataParams<D> {
  endpoint: string;
  params: any;
  user_id?: number | null;
  options?: UseQueryOptions<D, useCuppaZeeDataError>;
}

export type useCuppaZeeDataResponse<D> = UseQueryResult<D, useCuppaZeeDataError> & {
  tokenStatus: useTokenStatus;
  tokenDetails: useTokenDetails;
};

export default function useCuppaZeeData<D>(
  params: useCuppaZeeDataParams<D>
): useCuppaZeeDataResponse<D> {
  const [token, tokenStatus, _refetchToken, tokenDetails] = useToken(params.user_id);
  const lastToken = useRef<string | null>(null);
  const data = useQuery<D, useCuppaZeeDataError>(
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
    tokenDetails,
  };
}
