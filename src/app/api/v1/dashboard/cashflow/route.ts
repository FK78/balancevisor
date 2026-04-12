import { v1Handler, dataResponse } from "@/lib/api-v1";
import { getCashflowForecast } from "@/lib/cashflow-forecast";

export const GET = v1Handler(async ({ userId }) => {
  const forecast = await getCashflowForecast(userId);
  return dataResponse(forecast);
});
