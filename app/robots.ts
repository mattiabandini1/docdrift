import { MetadataRoute } from "next";

/**
 * Robots.txt configuration generated at runtime.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getdocdrift.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
