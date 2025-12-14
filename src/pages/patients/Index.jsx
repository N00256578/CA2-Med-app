import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Eye, Pencil } from "lucide-react";
import DeleteBtn from "@/components/DeleteBtn";
import { useAuth } from "@/hooks/useAuth";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { useData } from "@/contexts/DataContext";

export default function Index() {
  const { patients, loading, refreshPatients } = useData();
  const { token } = useAuth();
  const [sortColumn, setSortColumn] = useState({
    column: "name",
    ascending: true,
  });
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const patientsVisible = useMemo(() => {
    let result = [...patients];

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (pat) =>
          `${pat.first_name} ${pat.last_name}`.toLowerCase().includes(q) ||
          pat.email.toLowerCase().includes(q)
      );
    }

    const { column, ascending } = sortColumn;

    switch (column) {
      case "name":
        ascending
          ? result.sort((a, b) => a.first_name.localeCompare(b.first_name))
          : result.sort((a, b) => b.first_name.localeCompare(a.first_name));
        break;
      case "email":
        ascending
          ? result.sort((a, b) => a.email.localeCompare(b.email))
          : result.sort((a, b) => b.email.localeCompare(a.email));
        break;
      case "birthday":
        ascending
          ? result.sort(
              (a, b) => new Date(a.date_of_birth) - new Date(b.date_of_birth)
            )
          : result.sort(
              (a, b) => new Date(b.date_of_birth) - new Date(a.date_of_birth)
            );
        break;
    }
    return result;
  }, [patients, sortColumn, search]);

  if (loading) {
    return <Loader name="patients" />;
  }

  const onDeleteCallback = () => {
    toast.success("Patient deleted successfully");
    refreshPatients();
  };

  const changeSortOrder = (column) => {
    if (sortColumn.column === column) {
      setSortColumn({ column, ascending: !sortColumn.ascending });
    } else {
      setSortColumn({ column, ascending: true });
    }
  };

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

      <Table>
        <TableCaption>A list of patients.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => changeSortOrder("name")}
              className="cursor-pointer"
            >
              <div className="flex">
                Name
                {sortColumn.column === "name" ? (
                  <div className="ml-auto">
                    {sortColumn.ascending ? <ArrowDown /> : <ArrowUp />}
                  </div>
                ) : null}
              </div>
            </TableHead>
            <TableHead
              onClick={() => changeSortOrder("birthday")}
              className="cursor-pointer"
            >
              <div className="flex">
                Birthdate
                {sortColumn.column === "birthday" ? (
                  <div className="ml-auto">
                    {sortColumn.ascending ? <ArrowDown /> : <ArrowUp />}
                  </div>
                ) : null}
              </div>
            </TableHead>
            <TableHead
              onClick={() => changeSortOrder("email")}
              className="cursor-pointer"
            >
              <div className="flex">
                Email
                {sortColumn.column === "email" ? (
                  <div className="ml-auto">
                    {sortColumn.ascending ? <ArrowDown /> : <ArrowUp />}
                  </div>
                ) : null}
              </div>
            </TableHead>
            <TableHead>Phone number</TableHead>
            {token && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {patientsVisible.map((patient, index) => (
            <TableRow
              key={patient.id}
              style={{ backgroundColor: index % 2 === 0 ? "" : "#f9f9f9" }}
            >
              <TableCell>
                {patient.first_name} {patient.last_name}
              </TableCell>
              <TableCell>
                {new Date(patient.date_of_birth * 1000).toLocaleDateString()}
              </TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              {token && (
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      className="cursor-pointer hover:border-blue-500"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/patients/${patient.first_name}-${patient.last_name}`,
                          { state: { id: patient.id } }
                        )
                      }
                    >
                      <Eye />
                    </Button>
                    <Button
                      className="cursor-pointer hover:border-blue-500"
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/doctors/${patient.id}/edit`)}
                    >
                      <Pencil />
                    </Button>
                    <DeleteBtn
                      onDeleteCallback={onDeleteCallback}
                      resource="patients"
                      id={patient.id}
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
