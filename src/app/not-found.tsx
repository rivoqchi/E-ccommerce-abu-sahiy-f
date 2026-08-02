import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground">
        Sahifa topilmadi
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        So&apos;ralgan sahifa mavjud emas yoki ko&apos;chirilgan.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
