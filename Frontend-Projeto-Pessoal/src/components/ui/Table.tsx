import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      <table className="data-table">{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead>{children}</thead>;
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className }: TableRowProps) {
  return (
    <tr
      className={cn(onClick && "cursor-pointer", className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  width?: number | string;
}

export function TableHead({ children, className, align = "left", width }: TableHeadProps) {
  return (
    <th
      className={className}
      style={{
        textAlign: align,
        width: width,
      }}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function TableCell({ children, className, align = "left" }: TableCellProps) {
  return (
    <td className={className} style={{ textAlign: align }}>
      {children}
    </td>
  );
}

interface EmptyTableProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyTable({ icon, title, description, action }: EmptyTableProps) {
  return (
    <div className="empty-state py-12">
      <span className="text-[#4B5563] mb-3">{icon}</span>
      <p className="text-[#F5F5F5] font-medium mb-1">{title}</p>
      {description && <p className="text-sm text-[#9CA3AF] mb-4">{description}</p>}
      {action}
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="skeleton h-10 flex-1"
              style={{ animationDelay: `${(i * cols + j) * 0.05}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
