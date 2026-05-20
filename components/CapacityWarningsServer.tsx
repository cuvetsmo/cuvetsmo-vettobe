import { getCapacityWarnings } from "@/lib/data/source";
import { CapacityWarnings } from "./CapacityWarnings";

/**
 * Server-side wrapper that fetches warnings then hands off to the
 * client/server display component. Mounted from server pages only.
 */
export async function CapacityWarningsServer({ yearId }: { yearId: number }) {
  const warnings = await getCapacityWarnings(yearId);
  return <CapacityWarnings warnings={warnings} yearId={yearId} />;
}
