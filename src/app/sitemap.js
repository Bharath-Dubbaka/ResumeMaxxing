/**
 * @typedef {import("next").MetadataRoute.Sitemap} Sitemap
 */

/** @type {() => Sitemap} */
export default function sitemap() {
  return [
    {
      url: "https://resumeonfly.netlify.app/",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://resumeonfly.netlify.app/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://resumeonfly.netlify.app/contact",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://resumeonfly.netlify.app/faq",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://resumeonfly.netlify.app/about",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    //   {
    //      url: "https://resumeonfly.app/termsandconditions",
    //      lastModified: new Date(),
    //      changeFrequency: "weekly",
    //      priority: 0.8,
    //   },

    //   {
    //      url: "https://resumeonfly.app/privacypolicy",
    //      lastModified: new Date(),
    //      changeFrequency: "weekly",
    //      priority: 0.8,
    //   },
  ];
}
