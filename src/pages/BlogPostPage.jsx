import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const articles = {
  "style-as-self-expression": {
    category: "STYLE & IDENTITY",
    title: "Style as a form of self-expression",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=85",
    paragraphs: [
      "Clothing can be more than something we put on each morning. It can be an expression of identity, personality, memories, and the influences that shape us.",
      "Personal style is not about following every trend. It is about discovering what feels authentic and building a wardrobe around pieces that allow you to express that identity.",
      "At Vestirhaus, we believe style should leave room for individuality. Wear what moves you, and make each piece your own.",
    ],
  },
  "building-an-everyday-wardrobe": {
    category: "THE WARDROBE",
    title: "Building an everyday wardrobe with intention",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=85",
    paragraphs: [
      "A useful everyday wardrobe begins with understanding how you live, what you enjoy wearing, and what makes you feel comfortable.",
      "Choose versatile foundations, add pieces with personality, and pay attention to how garments work together. Thoughtful choices can make getting dressed easier.",
      "The best wardrobe is one that works for your life rather than one that simply follows a checklist.",
    ],
  },
  "the-beauty-of-african-inspiration": {
    category: "CULTURE",
    title: "The beauty of African inspiration in modern style",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85",
    paragraphs: [
      "African creativity offers a rich source of colour, form, craft, and visual inspiration. Its influence continues to find new expression in contemporary fashion.",
      "Modern design can celebrate those influences while making room for fresh interpretations and individual creativity.",
      "For us, inspiration is an invitation to keep exploring the connections between culture, design, and personal style.",
    ],
  },
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const article = articles[slug];

  if (!article) return <Navigate to="/blog" replace />;

  return (
    <main className="min-h-screen bg-[#F7F0E6] text-[#211B18]">
      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs text-[#766B63] hover:text-[#A94F32]"
        >
          <ArrowLeft size={14} /> Back to journal
        </Link>

        <p className="mt-12 text-[10px] uppercase tracking-[0.22em] text-[#A94F32]">
          {article.category}
        </p>

        <h1 className="mt-4 font-serif text-5xl leading-tight tracking-[-0.06em] sm:text-7xl">
          {article.title}
        </h1>

        <div className="mt-9 aspect-[16/9] overflow-hidden bg-[#E6DACC]">
          <img
            src={article.image}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto mt-10 max-w-2xl space-y-6">
          {article.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-base leading-8 text-[#766B63]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 border-t border-[#211B18]/10 pt-7">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 text-xs font-medium"
          >
            Explore Vestirhaus <ArrowLeft size={14} />
          </Link>
        </div>
      </article>
    </main>
  );
}