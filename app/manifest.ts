import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vet to be — ศูนย์รวมโครงการ Vet to be CUVET",
    short_name: "Vet to be",
    description: "ค้นหาประสบการณ์ฝึก Vet to be ย้อนหลัง · รีวิวแผนก · จัดการรอบใหม่",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6e9",
    theme_color: "#c44827",
    orientation: "portrait",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
    categories: ["education", "medical", "productivity"],
    lang: "th",
  };
}
