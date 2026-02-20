import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../../screens/RouteStubScreen";

export default function AccountEmailPage() {
  const route = getRouteByKey("accountEmail");
  return <RouteStubScreen title={route.title ?? "Email Login"} path={ROUTE_PATHS.accountEmail} />;
}
