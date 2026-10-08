This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli).

## Full stack

The UI talks to the Django REST API in [`../backend`](../backend). Data is no
longer mocked: see `backend/README.md` for setup, endpoints and seeded demo
accounts. Point the client at the API with:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

## Getting Started

First, run the backend (see `../backend/README.md`), then the dev server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API layer

| File | Purpose |
| --- | --- |
| `lib/api/client.ts` | fetch wrapper: base URL, JWT storage, automatic refresh-and-retry |
| `lib/api/auth.ts` | login / demo login / register / me / logout |
| `lib/api/courses.ts` | catalogue, reviews, enrollment, lessons |
| `lib/api/live.ts`, `lib/api/admin.ts`, `lib/api/instructor.ts` | live classes, admin console, instructor portal |
| `services/studyService.ts` | dashboard, decks, flashcards, cases, QBank, analytics |

Auth state lives in Redux (`store/slices/authSlice.ts`) and is populated from the
API response; tokens are kept in `localStorage` under `tiryaq.accessToken` /
`tiryaq.refreshToken`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
