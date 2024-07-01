import { getProductById } from "@/app/admin/_actions/productsActions";
import { Product } from "@prisma/client";

import PageHeader from "@/app/admin/_components/PageHeader";
import ProductForm from "@/app/admin/_components/ProductForm";

export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product: Product | null = await getProductById(id);

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
}
