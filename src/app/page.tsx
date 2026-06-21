import { redirect } from "next/navigation";

export default function Home() {
  // The AI career chat is the app's entry point.
  redirect("/compass");
}
