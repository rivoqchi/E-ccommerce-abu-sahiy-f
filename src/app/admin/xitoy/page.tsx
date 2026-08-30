"use client";

import { XitoyProductsSection } from "@/components/admin/XitoyProductsSection";

export default function AdminXitoyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Xitoy mahsulotlari
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Import narxlari va logistika ma&apos;lumotlari
        </p>
      </div>

      <XitoyProductsSection />
    </div>
  );
}
