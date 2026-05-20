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

Year is a first-class entity. The 2569 (2026) data covers the full 290 assignments
across 161 students from `ตารางรายแผนก_FINAL.pdf` (5/19), co-organized by ทีมหัวปี
**cuvet86 + cuvet87** — รุ่นพี่ปี 5 + รุ่นน้องปี 4 ช่วยกันรับฟอร์ม จัด อันดับ และ
swap manual หลายรอบ.

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

## Status

Phases 1–14 shipped (2026-05-20). Live at https://vettobe.cuvetsmo.com.

Highlights:

- ✅ 290-row 2569 dataset synced from FINAL PDF (5/19) via idempotent pipeline
- ✅ Magic-link auth + per-dept reviews + crowdsource backfill (/contribute)
- ✅ Operations console (/admin): edit · CSV bulk import · issue queue · capacity audit (/admin/audit)
- ✅ Per-student profile + dynamic OG image (with Noto Sans Thai)
- ✅ PWA installable + mobile bottom-nav + dark mode + share intents + 404/500 pages
- ✅ ทีมหัวปี credits (cuvet86 + cuvet87 for 2569)

See `sessions/` in the MycOS vault for the full per-phase log.

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
