import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Filter, Trash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useSortColumn } from "@/hooks/useSortColumn";
import { sortData } from "@/utils/sortData";
import useSWR from "swr";
import { deleteById, getAll } from "@/api";
import AsyncData from "@/components/AsyncData";
import useSWRMutation from "swr/mutation";
import DataTable from "@/components/DataTable";

export default function Index() {
  const { token } = useAuth();
  const { sortColumn, changeSortOrder } = useSortColumn();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState(new Set());

  const { data: doctors = [], isLoading, error } = useSWR("doctors", getAll);
  const { trigger: deleteDoctor, error: deleteError } = useSWRMutation(
    "doctors",
    deleteById
  );

  const specialisations = useMemo(() => {
    return Array.from(
      new Set(doctors.map((d) => d.specialisation).filter(Boolean))
    );
  }, [doctors]);

  const toggleSpec = (spec) => {
    setSpecFilter((prev) => {
      const next = new Set(prev);
      if (next.has(spec)) {
        next.delete(spec);
      } else {
        next.add(spec);
      }
      return next;
    });
  };

  // Filter and sort doctors
  const { tableData, tableConfig } = useMemo(() => {
    let result = [...doctors];

    // Apply search filter
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          `${d.first_name.toLowerCase()} ${d.last_name.toLowerCase()}`.includes(
            q
          ) || d.email.toLowerCase().includes(q)
      );
    }

    // Apply specialisation filter
    if (specFilter.size > 0) {
      result = result.filter((d) => specFilter.has(d.specialisation));
    }

    // Define comparators for sorting
    const comparators = {
      name: (a, b) => a.first_name.localeCompare(b.first_name),
      email: (a, b) => a.email.localeCompare(b.email),
      spec: (a, b) => a.specialisation.localeCompare(b.specialisation),
    };

    // Define columns
    const columns = [
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (row) => `${row.first_name} ${row.last_name}`,
      },
      {
        key: "email",
        label: "Email",
        sortable: true,
      },
      {
        key: "phone",
        label: "Phone number",
        sortable: false,
      },
      {
        key: "spec",
        label: "Specialisation",
        sortable: true,
        render: (row) => row.specialisation,
      },
    ];

    if (token) {
      columns.push({
        key: "actions",
        label: "",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2 justify-end">
            <Button
              className="cursor-pointer hover:border-blue-500"
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/doctors/${row.first_name}-${row.last_name}-${row.id}`
                );
              }}
            >
              <Eye />
            </Button>
            <Button
              className="cursor-pointer hover:border-blue-500"
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/doctors/${row.id}/edit`);
              }}
            >
              <Pencil />
            </Button>
            <Button
              className="cursor-pointer text-red-500 hover:border-red-700 hover:text-red-700"
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteDoctor(row.id);
                toast.success("Doctor deleted successfully");
              }}
            >
              <Trash />
            </Button>
          </div>
        ),
      });
    }

    const sortedData = sortData(
      result,
      sortColumn.column,
      sortColumn.ascending,
      comparators
    );

    return {
      tableData: sortedData,
      tableConfig: {
        columns,
        caption: "A list of doctors.",
        onRowClick: token
          ? (row) => `/doctors/${row.first_name}-${row.last_name}-${row.id}`
          : null,
      },
    };
  }, [doctors, search, sortColumn, specFilter, token, navigate, deleteDoctor]);

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        {token && (
          <Button asChild variant="outline">
            <Link to="/doctors/create">Create New Doctor</Link>
          </Button>
        )}

        <input
          type="text"
          value={search}
          className="flex-1 block border border-gray-300 rounded-md px-3 py-2"
          placeholder="Search doctor..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter by Specialisation
              {specFilter.size > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {specFilter.size}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Specialisations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {specialisations.map((spec) => (
              <DropdownMenuCheckboxItem
                key={spec}
                checked={specFilter.has(spec)}
                onCheckedChange={() => toggleSpec(spec)}
                onSelect={(e) => e.preventDefault()}
              >
                {spec}
              </DropdownMenuCheckboxItem>
            ))}
            {specFilter.size > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setSpecFilter(new Set())}
                >
                  Clear filters
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AsyncData loading={isLoading} error={error || deleteError}>
        <DataTable
          data={tableData}
          columns={tableConfig.columns}
          caption={tableConfig.caption}
          sortColumn={sortColumn}
          onSort={changeSortOrder}
          onRowClick={tableConfig.onRowClick}
        />
      </AsyncData>
    </>
  );
}
