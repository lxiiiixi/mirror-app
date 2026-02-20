import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../../screens/RouteStubScreen";

export default function VipPage() {
  const route = getRouteByKey("vip");
  return <RouteStubScreen title={route.title ?? "VIP"} path={ROUTE_PATHS.vip} />;
}
