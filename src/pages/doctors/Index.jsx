import { useEffect, useState } from "react";
import axios from "@/config/api";
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
  const [doctors, setDoctors] = useState([]);
  const { token } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      const options = {
        method: "GET",
        url: "/doctors",
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setDoctors(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDoctors();
  }, []);

  const onDeleteCallback = (id) => {
    toast.success("Doctor deleted successfully");
    setDoctors(doctors.filter((doctor) => doctor.id !== id));
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
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
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
                      onClick={() => navigate(`/doctors/${doctor.id}`)}
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
