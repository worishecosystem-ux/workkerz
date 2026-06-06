import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://workkerz.com",
      priority: 1,
      changeFrequency: "daily",
    },
    {
      url: "https://workkerz.com/browse",
      priority: 0.9,
      changeFrequency: "daily",
    },
    {
      url: "https://workkerz.com/workers",
      priority: 0.9,
      changeFrequency: "daily",
    },
    {
      url: "https://workkerz.com/eaurix",
      priority: 0.9,
      changeFrequency: "daily",
    },
    {
      url: "https://workkerz.com/eaurix/shop",
      priority: 0.9,
      changeFrequency: "daily",
    },
  ];
}