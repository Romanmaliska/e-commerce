import Link from "next/link";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";

import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import PageHeader from "@/app/admin/_components/PageHeader";
import DeleteProductButton from "../_components/DeleteProductButton";
import ProductAvailabilityToggler from "@/app/admin/_components/ProductAvailabilityToggler";

import { getProducts } from "@/app/admin/_actions/productsActions";

import { formatCurrency, formatNumber } from "@/lib/formaters";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <PageHeader>Products</PageHeader>
        <Button>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
      <ProductTable />
    </div>
  );
}

async function ProductTable() {
  const products = await getProducts();

  if (!products.length) {
    return <p>No products found. </p>;
  }

  console.log(products);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0">
            <span className="sr-only">Available for purchase</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map(
          ({ id, isAvailableForPurchase, name, priceInCents, _count }) => (
            <TableRow key={id}>
              <td className="px-4">
                {isAvailableForPurchase ? (
                  <>
                    <span className="sr-only"></span>
                    <CheckCircle2 />
                  </>
                ) : (
                  <>
                    <span className="sr-only"></span>
                    <XCircle className="stroke-destructive" />
                  </>
                )}
              </td>
              <td className="px-4">{name}</td>
              <td className="px-4">{formatCurrency(priceInCents / 100)}</td>
              <td className="px-4">{formatNumber(_count.orders)}</td>
              <td>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <a download href={`/admin/products/${id}/download`}>
                        Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={`/admin/products/${id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <ProductAvailabilityToggler
                      id={id}
                      isAvailableForPurchase={isAvailableForPurchase}
                    />
                    <DropdownMenuSeparator />
                    <DeleteProductButton id={id} disabled={_count.orders > 0} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}
