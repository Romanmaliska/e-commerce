import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";

import fs from "fs/promises";

import { getProductById } from "@/app/admin/_actions/productsActions";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const product = await getProductById(id);

  if (product === null) return notFound();

  const { size } = await fs.stat(product.filePath);
  const file = await fs.readFile(product.filePath);
  const fileExtension = product.filePath.split(".").pop();

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${product.name}.${fileExtension}"`,
      "Content-Length": size.toString(),
    },
  });
}
