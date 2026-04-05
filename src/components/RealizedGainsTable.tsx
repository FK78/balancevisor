"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatCurrency";

type Sale = {
  id: string;
  holding_id: string;
  date: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  realized_gain: number;
  cash_account_id: string | null;
  notes: string | null;
  created_at: Date;
  holding: {
    ticker: string | null;
    name: string;
    investment_type: "stock" | "real_estate" | "private_equity" | "other" | null;
    currency: string;
  } | null;
  cashAccountName: string | null;
};

type RealizedGainsTableProps = {
  sales: Sale[];
  baseCurrency: string;
};

export function RealizedGainsTable({ sales, baseCurrency }: RealizedGainsTableProps) {
  if (sales.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No realized gains yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          When you sell a holding, the realized gain will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Holding</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Realized Gain</TableHead>
            <TableHead className="text-right">Cash Account</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(sale.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium">
                      {sale.holding?.ticker ? sale.holding.ticker : sale.holding?.name ?? "Unknown holding"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {sale.holding?.ticker ? sale.holding.name : ""}
                    </p>
                  </div>
                  {sale.holding?.investment_type && (
                    <Badge
                      variant={sale.holding.investment_type === "stock" ? "secondary" : "outline"}
                      className="text-[10px] shrink-0"
                    >
                      {sale.holding.investment_type === "stock"
                        ? "Stock"
                        : sale.holding.investment_type === "real_estate"
                        ? "Real Estate"
                        : sale.holding.investment_type === "private_equity"
                        ? "Private Equity"
                        : "Other"}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {sale.quantity.toFixed(sale.quantity % 1 === 0 ? 0 : 4)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(sale.price_per_unit, sale.holding?.currency ?? baseCurrency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(sale.total_amount, sale.holding?.currency ?? baseCurrency)}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`tabular-nums text-sm font-medium ${
                    sale.realized_gain >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {sale.realized_gain >= 0 ? "+" : "−"}
                  {formatCurrency(Math.abs(sale.realized_gain), sale.holding?.currency ?? baseCurrency)}
                </span>
                <p className="text-xs text-muted-foreground">
                  {sale.realized_gain >= 0 ? "+" : ""}
                  {sale.total_amount > 0
                    ? ((sale.realized_gain / sale.total_amount) * 100).toFixed(2)
                    : "0.00"}
                  %
                </p>
              </TableCell>
              <TableCell className="text-right">
                {sale.cashAccountName ? (
                  <span className="text-sm">{sale.cashAccountName}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {sale.notes ? (
                  <p className="text-sm text-muted-foreground truncate">{sale.notes}</p>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}