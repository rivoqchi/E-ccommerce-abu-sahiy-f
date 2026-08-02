# UyTexnika Frontend

Maishiy texnika va idishlar e-commerce do'koni — Next.js App Router frontend.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Zustand (savat, persist)
- `next/image`, `next/font`, ISR, JSON-LD SEO

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda: [http://localhost:3000](http://localhost:3000)

## Skriptlar

- `npm run dev` — development
- `npm run build` — production build
- `npm start` — production server
- `npm run lint` — ESLint

## Muhit o'zgaruvchilari

`.env.local` (ixtiyoriy):

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Productionda haqiqiy domenni qo'ying (sitemap/robots/OG uchun).
