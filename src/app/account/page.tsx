import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = {
  title: "Profil",
  description: "Foydalanuvchi profili va hisob sozlamalari.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountView />;
}
