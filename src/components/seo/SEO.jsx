import React from "react";
import { Helmet } from "react-helmet-async";

export default function SEO({
  title,
  description,
  keywords = [],
  ogImage,
  ogType = "website",
  canonicalUrl,
  noindex = false,
}) {
  const siteTitle = "BuyersAlike";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = "Join BuyersAlike, a professional networking platform for connecting with like-minded business partners, collaborators, and growth-focused professionals.";
  const metaDescription = description || defaultDescription;
  const defaultKeywords = ["business networking", "partnerships", "investments", "acquisitions", "joint ventures", "entrepreneurs"];
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={allKeywords.join(", ")} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Robots Meta Tag */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Additional SEO Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
    </Helmet>
  );
}