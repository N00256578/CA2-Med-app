import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, ArrowDown, ArrowUp, Filter } from "lucide-react";
import DeleteBtn from "@/components/DeleteBtn";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
import { useMemo, useState } from "react";

export default function Index() {
  const { doctors, loading, refreshDoctors } = useData();
  const { token } = useAuth();
  const [sortColumn, setSortColumn] = useState({
    column: "name",
    ascending: true,
  });
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState(new Set());

  const navigate = useNavigate();

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

  const doctorsVisible = useMemo(() => {
    let result = [...doctors];

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          `${d.first_name.toLowerCase()} ${d.last_name.toLowerCase()}`.includes(
            q
          ) || d.email.toLowerCase().includes(q)
      );
    }

    if (specFilter.size > 0) {
      result = result.filter((d) => specFilter.has(d.specialisation));
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
      case "spec":
        ascending
          ? result.sort((a, b) =>
              a.specialisation.localeCompare(b.specialisation)
            )
          : result.sort((a, b) =>
              b.specialisation.localeCompare(a.specialisation)
            );
        break;
    }

    return result;
  }, [doctors, search, sortColumn, specFilter]);

  if (loading) {
    return <Loader name="doctors" />;
  }

  const onDeleteCallback = () => {
    toast.success("Doctor deleted successfully");
    refreshDoctors();
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
            <Link to={`/doctors/create`}>Create New Doctor</Link>
          </Button>
        )}

        <input
          type="text"
          value={search}
          className="flex-1 block border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search doctor..."
          onChange={(e) => {
            setSearch(e.target.value);
          }}
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

      <Table>
        <TableCaption>A list of doctors.</TableCaption>
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
            <TableHead
              onClick={() => changeSortOrder("spec")}
              className="cursor-pointer"
            >
              <div className="flex">
                Specialisation
                {sortColumn.column === "spec" ? (
                  <div className="ml-auto">
                    {sortColumn.ascending ? <ArrowDown /> : <ArrowUp />}
                  </div>
                ) : null}
              </div>
            </TableHead>
            {token && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctorsVisible.map((doctor, index) => (
            <TableRow
              key={doctor.id}
              style={{ backgroundColor: index % 2 === 0 ? "" : "#f9f9f9" }}
            >
              <TableCell>
                {doctor.first_name} {doctor.last_name}
              </TableCell>
              <TableCell>{doctor.email}</TableCell>
              <TableCell>{doctor.phone}</TableCell>
              <TableCell>{doctor.specialisation}</TableCell>
              {token && (
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      className="cursor-pointer hover:border-blue-500"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/doctors/${doctor.first_name}-${doctor.last_name}`,
                          { state: { id: doctor.id } }
                        )
                      }
                    >
                      <Eye />
                    </Button>
                    <Button
                      className="cursor-pointer hover:border-blue-500"
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                    >
                      <Pencil />
                    </Button>
                    <DeleteBtn
                      onDeleteCallback={onDeleteCallback}
                      resource="doctors"
                      id={doctor.id}
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
