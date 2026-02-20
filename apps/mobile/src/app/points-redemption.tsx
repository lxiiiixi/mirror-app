import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../screens/RouteStubScreen";

export default function PointsRedemptionPage() {
  const route = getRouteByKey("pointsRedemption");
  return (
    <RouteStubScreen
      title={route.title ?? "Points Redemption"}
      path={ROUTE_PATHS.pointsRedemption}
    />
  );
}
