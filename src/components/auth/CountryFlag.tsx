import { cn } from "@/lib/utils";

type CountryFlagProps = {
  code: string;
  className?: string;
  title?: string;
};

/** Windows does not render emoji flags — use CDN images instead. */
export function CountryFlag({ code, className, title }: CountryFlagProps) {
  const iso = code.toLowerCase();

  return (
    // eslint-disable-next-line @next/next/no-img-element -- small flag CDN asset
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      alt=""
      title={title}
      width={20}
      height={15}
      loading="lazy"
      decoding="async"
      className={cn(
        "inline-block h-[15px] w-5 shrink-0 rounded-[2px] object-cover",
        className,
      )}
    />
  );
}
