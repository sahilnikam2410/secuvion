import { Helmet } from "react-helmet-async";

const defaults = {
  siteName: "SECUVION",
  title: "SECUVION - AI-Powered Cyber Defense Platform",
  description: "Enterprise-grade cybersecurity for everyone. Real-time threat detection, fraud analysis, and digital protection powered by AI.",
  url: "https://secuvion.onrender.com",
};

export default function SEO({ title, description, path = "" }) {
  const pageTitle = title ? `${title} | ${defaults.siteName}` : defaults.title;
  const pageDesc = description || defaults.description;
  const pageUrl = `${defaults.url}${path}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="theme-color" content="#030712" />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={defaults.siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
    </Helmet>
  );
}
