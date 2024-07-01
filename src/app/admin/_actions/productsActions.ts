"use server";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import fs from "fs/promises";

import db from "@/db/db";

// Base schema for any file, ensuring it's an instance of File and has a size greater than 0.
const baseFileSchema = z.instanceof(File).refine((file) => file.size > 0, {
  message: "File must not be empty",
});

// Schema specifically for images, extending baseFileSchema with an additional check for the file type.
const imageSchema = baseFileSchema.refine(
  (file) => file.type.startsWith("image/"),
  { message: "File must be an image" }
);

const productSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  priceInCents: z.coerce
    .number()
    .min(1, { message: "Price must be greater than 0" }),
  file: baseFileSchema || z.literal(null),
  image: imageSchema || z.literal(null),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const productData = productSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!productData.success) {
    console.log(productData.error.formErrors.fieldErrors);
    return productData.error.formErrors.fieldErrors;
  }

  const { name, description, priceInCents, file, image } = productData.data;

  await fs.mkdir(`products`, { recursive: true });
  const filePath = `products/${crypto.randomUUID()}-${file.name}`;
  await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  await fs.mkdir(`public/products`, { recursive: true });
  const imagePath = `public/products/${crypto.randomUUID()}-${image.name}`;
  await fs.writeFile(imagePath, Buffer.from(await image.arrayBuffer()));

  await db.product.create({
    data: {
      name,
      description,
      priceInCents,
      filePath,
      imagePath,
      isAvailableForPurchase: false,
    },
  });

  redirect("/admin/products");
}

export async function getProducts() {
  return db.product.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getProductById(id: string) {
  return await db.product.findUnique({
    where: { id },
  });
}

export async function deleteProduct(productId: string) {
  const product = await db.product.delete({ where: { id: productId } });

  if (product === null) return notFound();

  await fs.unlink(product.filePath);
  await fs.unlink(product.imagePath);

  revalidatePath("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const productData = productSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!productData.success) {
    return productData.error.formErrors.fieldErrors;
  }

  const { name, description, priceInCents, file, image } = productData.data;

  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return { id: "Product not found" };
  }

  const filePath = product.filePath;
  if (file.size > 0) {
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  const imagePath = product.imagePath;
  if (image.size > 0) {
    await fs.writeFile(imagePath, Buffer.from(await image.arrayBuffer()));
  }

  await db.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      priceInCents,
    },
  });

  redirect("/admin/products");
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });

  revalidatePath("/admin/products");
}
