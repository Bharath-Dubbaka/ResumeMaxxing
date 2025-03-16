/**
 * @typedef {import("next").MetadataRoute.Robots} Robots
 */

/** @type {() => Robots} */
export default function robots() {
   return {
      rules: {
         userAgent: "*",
         allow: "/",
         disallow: ["/dashboard", "/userFormPage"],
      },
      sitemap: "https://resumeonfly.com//sitemap.xml",
   };
}
