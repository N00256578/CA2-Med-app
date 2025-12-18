import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSortColumn } from "@/hooks/useSortColumn";
import useSWR from "swr";
import { deleteById, getAll } from "@/api";
import useSWRMutation from "swr/mutation";
import AsyncData from "@/components/AsyncData";
import DataTable from "@/components/DataTable";
import { sortData } from "@/utils/sortData";
import ConfirmDelete from "@/components/ConfirmDelete";

export default function Index() {
  const { token } = useAuth();
  const { sortColumn, changeSortOrder } = useSortColumn();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const { data: patients = [], isLoading, error } = useSWR("patients", getAll);
  const { trigger: deletePatient, error: deleteError } = useSWRMutation(
    "patients",
    deleteById
  );

  const { tableData, tableConfig } = useMemo(() => {
    let result = [...patients];

    //Applu search filter
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          `${p.first_name.toLowerCase()} ${p.last_name.toLowerCase()}`.includes(
            q
          ) || p.email.toLowerCase().includes(q)
      );
    }

    // Define comparators for sorting
    const comparators = {
      name: (a, b) => a.first_name.localeCompare(b.first_name),
      email: (a, b) => a.email.localeCompare(b.email),
      birthday: (a, b) => a.date_of_birth - b.date_of_birth,
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
        key: "birthday",
        label: "Date of Birth",
        sortable: true,
        render: (row) =>
          new Date(row.date_of_birth * 1000).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
      },
      { key: "email", label: "Email", sortable: true },
      { key: "phone", label: "Phone number", sortable: false },
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
                  `/patients/${row.first_name}-${row.last_name}-${row.id}`
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
                navigate(`/patients/${row.id}/edit`);
              }}
            >
              <Pencil />
            </Button>
            <ConfirmDelete
              title="Delete patient"
              description="This patient will be permanently removed."
              onConfirm={(e) => {
                e.stopPropagation();
                deletePatient(row.id);
                toast.success("Patient deleted successfully");
              }}
            >
              <Button
                className="cursor-pointer text-red-500 hover:border-red-700 hover:text-red-700"
                variant="outline"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash />
              </Button>
            </ConfirmDelete>
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
        caption: "A list of patients.",
        onRowClick: token
          ? (row) => `/patients/${row.first_name}-${row.last_name}-${row.id}`
          : null,
      },
    };
  }, [patients, search, sortColumn, token, navigate, deletePatient]);

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        {token && (
          <Button asChild variant="outline">
            <Link to={`/patients/create`}>Create New Patient</Link>
          </Button>
        )}

        <input
          type="text"
          value={search}
          className="flex-1 block border border-gray-300 rounded-md px-3 py-2"
          placeholder="Search patients..."
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
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
