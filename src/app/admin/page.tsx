import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import db from "@/db/db";
import { formatNumber } from "@/lib/formaters";

async function getSalesData() {
  const salesData = await db.order.aggregate({
    _sum: {
      pricePaidInCents: true,
    },
    _count: true,
  });

  return {
    amount: (salesData._sum?.pricePaidInCents ?? 0) / 100,
    nuberOfSales: salesData._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);

  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents ?? 0) / userCount / 100,
  };
}

async function getProductsData() {
  const [activeProductsCount, unactiveProductsCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
  ]);

  return {
    activeProductsCount,
    unactiveProductsCount,
  };
}

export default async function AdminDashboard() {
  const [salesData, userData, productsData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductsData(),
  ]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Sales"
        description={`${formatNumber(salesData.nuberOfSales)} orders`}
        content={`$${formatNumber(salesData.amount)}`}
      />
      <DashboardCard
        title="Customers"
        description={`${formatNumber(
          userData.averageValuePerUser
        )} Average value per user`}
        content={formatNumber(userData.userCount)}
      />
      <DashboardCard
        title="Active Products"
        description={`${formatNumber(
          productsData.unactiveProductsCount
        )} inactive products`}
        content={`${formatNumber(
          productsData.activeProductsCount
        )} active products`}
      />
    </section>
  );
}

type DashboardCardProps = {
  title: string;
  description: string;
  content: string;
};

function DashboardCard({ title, description, content }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
