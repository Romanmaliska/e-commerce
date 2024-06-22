import { Navbar, NavbarLink } from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar>
        <NavbarLink href="/admin">Admin</NavbarLink>
        <NavbarLink href="/admin/products">Products</NavbarLink>
        <NavbarLink href="/admin/users">Customers</NavbarLink>
        <NavbarLink href="/admin/orders">Sales</NavbarLink>
      </Navbar>
      <section className="container my-6">{children}</section>
    </>
  );
}
