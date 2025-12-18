import { ArrowDown, ArrowUp } from "lucide-react";
import { TableHead } from "@/components/ui/table";

export const SortIcon = ({ column, sortColumn }) => {
  if (sortColumn.column !== column) return null;
  return sortColumn.ascending ? <ArrowDown /> : <ArrowUp />;
};

export const SortableHeader = ({ column, label, sortColumn, onClick }) => (
  <TableHead className="cursor-pointer" onClick={() => onClick(column)}>
    <div className="flex">
      {label}
      <div className="ml-auto">
        <SortIcon column={column} sortColumn={sortColumn} />
      </div>
    </div>
  </TableHead>
);
