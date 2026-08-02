import type { Metadata } from "next";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";

export const metadata: Metadata = {
  title: "Kirish",
  description:
    "Sami — kundalik xaridingizning ishonchli hamrohi. Maishiy texnika va oshxona anjomlari.",
  alternates: {
    canonical: "/welcome",
  },
};

export default function WelcomePage() {
  return <WelcomeHero />;
}
