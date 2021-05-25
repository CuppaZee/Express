import { StatzeePlayerDay } from "@cuppazee/api/statzee/player/day";
import dayjs from "dayjs";
import useCuppaZeeData from "./useCuppaZeeData";
import useMunzeeData from "./useMunzeeData";
import useToken, { useTokenStatus } from "./useToken";

export default function useActivity(user_id?: number, day?: string) {
  const [_a, tokenStatus, _b] = useToken(user_id);
  const cuppazee = useCuppaZeeData<{ data: StatzeePlayerDay["response"]["data"] }>({
    endpoint: "user/activity",
    params: {
      user_id,
      day: day ?? dayjs.mhqNow().format("YYYY-MM-DD"),
    },
    options: {
      enabled: user_id !== undefined && tokenStatus === useTokenStatus.Missing,
    },
  });
  const munzee = useMunzeeData({
    endpoint: "statzee/player/day",
    params: {
      day: day ?? dayjs.mhqNow().format("YYYY-MM-DD"),
    },
    options: {
      enabled: user_id !== undefined && tokenStatus !== useTokenStatus.Missing,
    },
    user_id,
  });
  return tokenStatus === useTokenStatus.Missing ? cuppazee : munzee;
}
