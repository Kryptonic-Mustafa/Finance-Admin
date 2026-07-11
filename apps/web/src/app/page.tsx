import { redirect } from "next/navigation";

export default function Home() {
  // Route root visits to the dashboard
  redirect("/dashboard");
}
