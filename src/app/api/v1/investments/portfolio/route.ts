import { v1Handler, dataResponse } from "@/lib/api-v1";
import { getPortfolioSnapshot } from "@/lib/portfolio-data";

export const GET = v1Handler(async ({ userId }) => {
  const snapshot = await getPortfolioSnapshot(userId);
  return dataResponse(snapshot);
});
