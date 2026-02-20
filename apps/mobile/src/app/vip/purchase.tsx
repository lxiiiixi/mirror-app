import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../../screens/RouteStubScreen";

export default function VipPurchasePage() {
  const route = getRouteByKey("vipPurchase");
  return <RouteStubScreen title={route.title ?? "VIP Purchase"} path={ROUTE_PATHS.vipPurchase} />;
}
