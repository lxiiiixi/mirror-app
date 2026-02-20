import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../../screens/RouteStubScreen";

export default function WorksDetailPage() {
  const route = getRouteByKey("worksDetail");
  return <RouteStubScreen title={route.title ?? "Work Detail"} path={ROUTE_PATHS.worksDetail} />;
}
