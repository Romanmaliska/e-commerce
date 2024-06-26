"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";

import {
  addProduct,
  updateProduct,
} from "@/app/admin/_actions/productsActions";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formaters";

import { Product } from "@prisma/client";

export default function ProductForm({ product }: { product?: Product | null }) {
  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    product?.priceInCents
  );

  const [error, formAction] = useFormState(
    product ? updateProduct.bind(null, product.id) : addProduct,
    {}
  );

  return (
    <form action={formAction} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          name="name"
          defaultValue={product?.name || ""}
          required
        />
        {error?.name && <div className="text-destructive">{error.name}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          id="priceInCents"
          type="number"
          name="priceInCents"
          value={priceInCents}
          onChange={(e) => setPriceInCents(Number(e.target.value))}
          required
        />
        {error?.priceInCents && (
          <div className="text-destructive">{error.priceInCents}</div>
        )}
        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description || ""}
          required
        />
        {error?.description && (
          <div className="text-destructive">{error.description}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input id="file" type="file" name="file" required={!product} />
        {product && (
          <div className="text-muted-foreground">{product.filePath}</div>
        )}
        {error?.file && <div className="text-destructive">{error.file}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input id="image" type="file" name="image" required={!product} />
        {error?.image && <div className="text-destructive">{error.image}</div>}
        {product && (
          <Image
            src={`/${product.imagePath}`}
            alt={product.name}
            width="400"
            height="400"
          />
        )}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving" : "Save"}
    </Button>
  );
}
