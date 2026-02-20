import { ROUTE_PATHS, getRouteByKey } from "@mirror/routes";
import { RouteStubScreen } from "../../screens/RouteStubScreen";

export default function AccountBillingPage() {
  const route = getRouteByKey("accountBilling");
  return (
    <RouteStubScreen title={route.title ?? "Billing History"} path={ROUTE_PATHS.accountBilling} />
  );
}
