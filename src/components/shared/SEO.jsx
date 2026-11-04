import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "Vestirhaus | Rooted in Culture",
  description = "African heritage, considered design, and everyday pieces that feel entirely your own.",
  image = "/og-image.jpg",
}) {
  const siteUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}