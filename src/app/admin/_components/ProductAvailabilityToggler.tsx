"use client";

import { useTransition } from "react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { toggleProductAvailability } from "../_actions/productsActions";

export default function ProductAvailabilityToggler({
  id,
  isAvailableForPurchase,
}: {
  id: string;
  isAvailableForPurchase: boolean;
}) {
  const [_, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      onClick={() => {
        startTransition(async () => {
          await toggleProductAvailability(id, !isAvailableForPurchase);
        });
      }}
    >
      {isAvailableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}
