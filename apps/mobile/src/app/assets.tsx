import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../screens/RouteStubScreen";

export default function AssetsPage() {
  const route = getRouteByKey("assets");
  return <RouteStubScreen title={route.title ?? "Assets"} path={ROUTE_PATHS.assets} />;
}
