import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../screens/RouteStubScreen";

export default function NotFoundScreen() {
  const route = getRouteByKey("notFound");
  return <RouteStubScreen title={route.title ?? "Not Found"} path={ROUTE_PATHS.notFound} />;
}
