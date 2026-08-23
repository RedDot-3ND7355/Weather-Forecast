import { createFileRoute } from "@tanstack/react-router";
import { ForecastApp } from "@/components/forecast-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ForecastApp />;
}
