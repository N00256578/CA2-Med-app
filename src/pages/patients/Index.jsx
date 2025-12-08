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
import Loader from "@/components/Loader";

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
  const [patients, setPatients] = useState([]);
  const { token } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      const options = {
        method: "GET",
        url: "/patients",
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setPatients(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPatients();
  }, []);

  if (patients.length === 0) {
    return <Loader name="patients" />;
  }

  const onDeleteCallback = (id) => {
    toast.success("Patient deleted successfully");
    setPatients(patients.filter((patient) => patient.id !== id));
  };

  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">
          <Link size="sm" to={`/patients/create`}>
            Create New Patient
          </Link>
        </Button>
      )}

      <Table>
        <TableCaption>A list of patients.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone number</TableHead>
            {token && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
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
                  <div className="flex gap-2">
                    <Button
                      className="cursor-pointer hover:border-blue-500"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/patients/${patient.first_name} ${patient.last_name}`
                        )
                      }
                    >
                      <Eye />
                    </Button>
                    <Button
                      className="cursor-pointer hover:border-blue-500"
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/patients/${patient.id}/edit`)}
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
