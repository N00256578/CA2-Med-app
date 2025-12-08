import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Show() {
  const location = useLocation();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState([]);
  const { patients, appointments } = useData();
  const { id } = location.state;
  const { token } = useAuth();
  const [selected, setSelected] = useState("Appointments");

  const doctorAppointments = appointments.filter(
    (app) => app.doctor_id === doctor.id
  );

  console.log("Appointments = ", doctorAppointments);

  const patientList = new Set(
    ...[doctorAppointments.map((app) => app.patient_id)]
  );

  const doctorPatients = patients
    .filter((pat) => patientList.has(pat.id))
    .sort((a, b) => a.first_name.localeCompare(b.first_name));
  console.log("Patients = ", doctorPatients);

  useEffect(() => {
    const fetchDoctor = async () => {
      const options = {
        method: "GET",
        url: `/doctors/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setDoctor(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDoctor();
  }, []);

  const selectionOptions = [
    "Appointments",
    "Patients",
    "Diagnoses",
    "Prescriptions",
  ];

  const Selector = (
    <div className="flex">
      {selectionOptions.map((option) => {
        return (
          <Button
            key={option}
            variant={selected === option ? "default" : "outline"}
            className="mr-2 mb-4"
            onClick={() => setSelected(option)}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );

  const selection =
    selected === "Patients" ? (
      <Table>
        <TableCaption>A list of patients.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctorPatients.map((patient, index) => (
            <TableRow
              key={patient.id}
              style={{
                cursor: "pointer",
                backgroundColor: index % 2 === 0 ? "" : "#f9f9f9",
              }}
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <TableCell>
                {patient.first_name} {patient.last_name}
              </TableCell>
              <TableCell>
                {new Date(patient.date_of_birth * 1000).toLocaleDateString()}
              </TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : selected === "Appointments" ? (
      <>Appointments</>
    ) : selected === "Diagnoses" ? (
      <>Diagnoses</>
    ) : selected === "Prescriptions" ? (
      <>Prescriptions</>
    ) : (
      <></>
    );

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {doctor.first_name} {doctor.last_name}
          </CardTitle>
          <CardDescription>{doctor.specialisation}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Email: {doctor.email}</p>
          <p className="mb-2">Phone: {doctor.phone}</p>
        </CardContent>
      </Card>
      {Selector}
      {selection}
    </>
  );
}
