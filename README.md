# vettobe.cuvetsmo.com

ศูนย์รวมโครงการ Vet to be — โครงการฝึกงานคลินิกของนิสิตคณะสัตวแพทยศาสตร์ จุฬาฯ
ที่โรงพยาบาลสัตว์เล็ก จุฬาฯ ตลอดช่วงปิดเทอมใหญ่

## What this is

A long-term home for everything Vet to be:

1. **Public student lookup** — search past trainees by ชื่อเล่น or เลขท้ายรหัสนิสิต
2. **Per-department reviews per year** — trainees rate departments after they finish
3. **Operations console** for ทีมหัวปี to run the next round (replaces the
   claude.ai + Excel workflow used by the 2569 team)
4. **Long-term historical archive** — multi-year support from day one
5. **Public hub / front door** for anyone curious about the program

Year is a first-class entity. The 2569 (2026) seed includes ~60 of 290 assignments
from the FINAL PDF + manual round-2+ swaps; the rest will be imported into
Supabase in Phase 1b.

## Stack

- Next.js 16.2.6 App Router + React 19.2.4 + TypeScript
- Tailwind 4
- Supabase (Phase 1b)
- Deployed via Vercel under custom domain `vettobe.cuvetsmo.com`

## Theme

"Parchment academic" — warm cream + deep forest + terracotta accents.
Distinct from sister subdomains by design:

| Sub-site | Theme |
|---|---|
| `labs.cuvetsmo.com` | cream + warm-orange editorial |
| `web3.cuvetsmo.com` | dark + Base Blue |
| `imaging.cuvetsmo.com` | dark + cyan + violet (clinical-creative) |
| **`vettobe.cuvetsmo.com`** | **parchment + deep forest + terracotta (academic warmth)** |

## Local dev

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Roadmap

- ✅ Phase 1a — Scaffold + theme + 4 core pages (home, lookup, years, dept)
- 🔜 Phase 1b — Supabase schema + import full 290-row 2569 dataset
- 🔜 Phase 1c — Auth + per-dept reviews
- 🔜 Phase 1d — Operations console for ทีมหัวปี (form intake, scheduler, publish)
- 📅 Phase 1e — Crowdsource backfill for 2567 + 2568

## Project structure

```
app/
├── page.tsx                              home
├── lookup/page.tsx                       student lookup (client-side filter)
├── years/page.tsx                        list of all years
├── years/[year]/page.tsx                 year overview + dept grid
├── years/[year]/depts/[dept]/page.tsx    dept × year detail + week list
├── about/page.tsx                        vision + roadmap
├── layout.tsx                            fonts + Brand + EcosystemBar
└── globals.css                           theme tokens

components/
├── Brand.tsx                             SiteHeader, SiteFooter, BrandMark
└── EcosystemBar.tsx                      top bar linking sister subdomains

lib/
├── types.ts                              core domain types
├── supabase.ts                           Phase 1b client placeholder
└── data/
    ├── departments.ts                    18 depts master list
    ├── years.ts                          year registry (2567, 2568, 2569)
    └── seed-2569.ts                      ~60-row partial seed from FINAL PDF
```

## Sister projects in the CUVETSMO ecosystem

- [cuvetsmo/cuvetsmo-labs](https://github.com/cuvetsmo/cuvetsmo-labs)
- [cuvetsmo/cuvetsmo-imaging](https://github.com/cuvetsmo/cuvetsmo-imaging)
- [cuvetsmo/cuvetsmo-web3](https://github.com/cuvetsmo/cuvetsmo-web3)
- [cuvetsmo/docs](https://github.com/cuvetsmo/docs)
