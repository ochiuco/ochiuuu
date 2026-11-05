import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://ochiu.co", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://ochiu.co/products", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://ochiu.co/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}