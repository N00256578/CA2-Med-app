import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
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

// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

export default function Index() {
  const { doctors, loading, refreshDoctors } = useData();
  const { token } = useAuth();

  const navigate = useNavigate();

  if (loading) {
    return <Loader name="doctors" />;
  }

  const onDeleteCallback = () => {
    toast.success("Doctor deleted successfully");
    refreshDoctors();
  };

  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">
          <Link size="sm" to={`/doctors/create`}>
            Create New Doctor
          </Link>
        </Button>
      )}

      <Table>
        <TableCaption>A list of doctors.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone number</TableHead>
            <TableHead>Specialisation</TableHead>
            {token && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors
            .sort((a, b) => a.first_name.localeCompare(b.first_name))
            .map((doctor, index) => (
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
                    <div className="flex gap-2">
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
