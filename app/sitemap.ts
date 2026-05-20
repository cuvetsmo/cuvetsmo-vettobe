import type { MetadataRoute } from "next";
import { getYears, getDepartments } from "@/lib/data/source";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://vettobe.cuvetsmo.com";
  const [years, depts] = await Promise.all([getYears(), getDepartments()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, priority: 1.0 },
    { url: `${base}/lookup`, lastModified: now, priority: 0.9 },
    { url: `${base}/years`, lastModified: now, priority: 0.8 },
    { url: `${base}/contribute`, lastModified: now, priority: 0.6 },
    { url: `${base}/about`, lastModified: now, priority: 0.5 },
  ];

  const yearRoutes: MetadataRoute.Sitemap = years.map((y) => ({
    url: `${base}/years/${y.id}`,
    lastModified: now,
    priority: y.status === "active" ? 0.9 : 0.7,
  }));

  const deptRoutes: MetadataRoute.Sitemap = years.flatMap((y) =>
    depts.map((d) => ({
      url: `${base}/years/${y.id}/depts/${d.slug}`,
      lastModified: now,
      priority: y.status === "active" ? 0.7 : 0.5,
    }))
  );

  return [...staticRoutes, ...yearRoutes, ...deptRoutes];
}
