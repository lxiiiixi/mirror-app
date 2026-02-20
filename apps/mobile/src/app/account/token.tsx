import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../../screens/RouteStubScreen";

export default function AccountTokenPage() {
  const route = getRouteByKey("accountToken");
  return <RouteStubScreen title={route.title ?? "Hold Token"} path={ROUTE_PATHS.accountToken} />;
}
