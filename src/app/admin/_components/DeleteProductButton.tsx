"use client";

import { useTransition } from "react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

import { deleteProduct } from "@/app/admin/_actions/productsActions";

export default function DeleteProductButton({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteProduct(id);
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}
