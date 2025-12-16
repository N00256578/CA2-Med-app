import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/SortableTable";
import { useNavigate } from "react-router";

export default function DataTable({
  data,
  columns,
  caption,
  sortColumn,
  onSort,
  onRowClick,
}) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((col) =>
            col.sortable ? (
              <SortableHeader
                key={col.key}
                column={col.key}
                label={col.label}
                sortColumn={sortColumn}
                onClick={onSort}
              />
            ) : (
              <TableHead key={col.key}>{col.label}</TableHead>
            )
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow
            key={row.id}
            className="cursor-pointer hover:bg-gray-100"
            style={{ backgroundColor: index % 2 !== 0 ? "" : "#f9f9f9" }}
            onClick={() => onRowClick && navigate(onRowClick(row))}
          >
            {columns.map((col) => (
              <TableCell key={col.key}>
                {col.render ? col.render(row) : row[col.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
