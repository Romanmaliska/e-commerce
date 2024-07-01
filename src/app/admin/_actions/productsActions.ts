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
    return productData.error.formErrors.fieldErrors;
  }

  const { name, description, priceInCents, file, image } = productData.data;

  await fs.mkdir(`products`, { recursive: true });
  const filePath = `products/${crypto.randomUUID()}-${file.name}`;
  await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  await fs.mkdir(`public/products`, { recursive: true });
  const imagePath = `products/${crypto.randomUUID()}-${image.name}`;
  await fs.writeFile(
    `public/${imagePath}`,
    Buffer.from(await image.arrayBuffer())
  );

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
  await fs.unlink(`public/${product.imagePath}`);

  revalidatePath("/admin/products");
}

const updateProductSchema = productSchema.extend({
  file: baseFileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateProduct(
  productId: string,
  prevState: unknown,
  formData: FormData
) {
  const productData = updateProductSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!productData.success) {
    return productData.error.formErrors.fieldErrors;
  }

  const { name, description, priceInCents, file, image } = productData.data;

  const productToUpdate = await db.product.findUnique({
    where: { id: productId },
  });

  if (!productToUpdate) return notFound();

  let filePath = productToUpdate.filePath;
  if (file && file.size > 0) {
    await fs.unlink(productToUpdate.filePath);
    filePath = `products/${crypto.randomUUID()}-${file.name}`;
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  }

  let imagePath = productToUpdate.imagePath;
  if (image && image.size > 0) {
    await fs.unlink(`public/${productToUpdate.imagePath}`);
    imagePath = `products/${crypto.randomUUID()}-${image.name}`;
    await fs.writeFile(
      `public/${imagePath}`,
      Buffer.from(await image.arrayBuffer())
    );
  }

  await db.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      priceInCents,
      ...(file ? { filePath } : {}),
      ...(image ? { imagePath } : {}),
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
