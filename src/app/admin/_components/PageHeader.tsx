export default function PageHeader({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <h1 className="text-4xl pb-4">{children}</h1>;
}
