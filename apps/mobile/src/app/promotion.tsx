import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../screens/RouteStubScreen";

export default function PromotionPage() {
  const route = getRouteByKey("promotion");
  return <RouteStubScreen title={route.title ?? "Promotion"} path={ROUTE_PATHS.promotion} />;
}
