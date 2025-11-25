import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products/",
          "/auth/",
          "/cart",
          "/profile",
          "/favourite",
          "/images/",
          "/*.css",
          "/*.js",
          "/*.png",
          "/*.jpg",
          "/*.jpeg",
          "/*.svg",
          "/*.webp",
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: "https://tiffanysec.com/sitemap.xml",
  };
}
