import useMunzeeData from "./useMunzeeData";

export default function useUserID(username: string) {
  return useMunzeeData({
    endpoint: "user",
    params: { username },
  }).data?.data?.user_id ?? null;
}
