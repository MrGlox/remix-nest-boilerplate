import { useRouteLoaderData } from "react-router";
import { loader } from "~/root";

export const useSession = () => {
  const data = useRouteLoaderData<typeof loader>("root");

  if (!data) {
    throw new Error("Root Loader did not return anything");
  }

  const { user } = data;

  if (!user) {
    return false;
  }

  return data.user;
};
