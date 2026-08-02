export type CountryOption = {
  code: string;
  dial: string;
  name: string;
  flag: string;
  /** National number digit length (approx) */
  nationalLength: number;
};

export const COUNTRIES: CountryOption[] = [
  { code: "UZ", dial: "+998", name: "Oʻzbekiston", flag: "🇺🇿", nationalLength: 9 },
  { code: "KZ", dial: "+7", name: "Qozogʻiston", flag: "🇰🇿", nationalLength: 10 },
  { code: "RU", dial: "+7", name: "Rossiya", flag: "🇷🇺", nationalLength: 10 },
  { code: "TJ", dial: "+992", name: "Tojikiston", flag: "🇹🇯", nationalLength: 9 },
  { code: "KG", dial: "+996", name: "Qirgʻiziston", flag: "🇰🇬", nationalLength: 9 },
  { code: "TM", dial: "+993", name: "Turkmaniston", flag: "🇹🇲", nationalLength: 8 },
  { code: "TR", dial: "+90", name: "Turkiya", flag: "🇹🇷", nationalLength: 10 },
  { code: "AE", dial: "+971", name: "BAA", flag: "🇦🇪", nationalLength: 9 },
  { code: "US", dial: "+1", name: "AQSH", flag: "🇺🇸", nationalLength: 10 },
  { code: "GB", dial: "+44", name: "Buyuk Britaniya", flag: "🇬🇧", nationalLength: 10 },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]!;

export function toE164(dial: string, national: string): string {
  const digits = national.replace(/\D/g, "");
  return `${dial}${digits}`;
}

export function isValidNational(
  country: CountryOption,
  national: string,
): boolean {
  const digits = national.replace(/\D/g, "");
  return (
    digits.length >= Math.max(7, country.nationalLength - 2) &&
    digits.length <= country.nationalLength + 1
  );
}
