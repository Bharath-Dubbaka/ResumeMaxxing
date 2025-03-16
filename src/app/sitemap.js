/**
 * @typedef {import("next").MetadataRoute.Sitemap} Sitemap
 */

/** @type {() => Sitemap} */
export default function sitemap() {
   return [
      {
         url: "https://resumeonfly.com/",
         lastModified: new Date(),
         changeFrequency: "yearly",
         priority: 1,
      },
      {
         url: "https://resumeonfly.com/pricing",
         lastModified: new Date(),
         changeFrequency: "monthly",
         priority: 0.8,
      },
      {
         url: "https://resumeonfly.com/contact",
         lastModified: new Date(),
         changeFrequency: "weekly",
         priority: 0.8,
      },
      {
         url: "https://resumeonfly.com/faq",
         lastModified: new Date(),
         changeFrequency: "weekly",
         priority: 0.8,
      },
      {
         url: "https://resumeonfly.com/about",
         lastModified: new Date(),
         changeFrequency: "weekly",
         priority: 0.8,
      },
    //   {
    //      url: "https://resumeonfly.com/termsandconditions",
    //      lastModified: new Date(),
    //      changeFrequency: "weekly",
    //      priority: 0.8,
    //   },

    //   {
    //      url: "https://resumeonfly.com/privacypolicy",
    //      lastModified: new Date(),
    //      changeFrequency: "weekly",
    //      priority: 0.8,
    //   },
   ];
}
