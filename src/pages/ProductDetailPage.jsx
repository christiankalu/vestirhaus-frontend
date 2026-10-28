import { useParams } from "react-router-dom";
import PagePlaceholder from "@/components/shared/PagePlaceholder";

export default function ProductDetailPage() {
  const { slug } = useParams();

  return (
    <PagePlaceholder
      title="Product details"
      description={`The product page for "${slug}" will be implemented in its dedicated phase.`}
    />
  );
}