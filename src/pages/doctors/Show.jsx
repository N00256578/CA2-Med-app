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
import Loader from "@/components/Loader";

export default function Show() {
  const location = useLocation();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState([]);
  const { patients, appointments, prescriptions, doctors } = useData();
  const { token } = useAuth();
  const [selected, setSelected] = useState("Appointments");

  const { id } = location.state ? location.state : { id: null };

  const doctorAppointments = appointments.filter(
    (app) => app.doctor_id === doctor.id
  );

  const patientList = new Set(
    ...[doctorAppointments.map((app) => app.patient_id)]
  );

  const doctorPatients = patients
    .filter((pat) => patientList.has(pat.id))
    .sort((a, b) => a.first_name.localeCompare(b.first_name));

  const doctorPres = prescriptions.filter((pre) => pre.doctor_id === doctor.id);

  useEffect(() => {
    let doctorId = id;
    if (id === null) {
      console.log("Finding doctor by name from URL: ", doctors);
      doctorId = doctors.find(
        (doc) =>
          `${doc.first_name}-${doc.last_name}` ===
          location.pathname.split("/").pop()
      )?.id;
    }

    const fetchDoctor = async () => {
      const options = {
        method: "GET",
        url: `/doctors/${doctorId}`,
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
  }, [doctors]);

  const selectionOptions = ["Appointments", "Patients", "Prescriptions"];

  const Selector = (
    <div className="flex">
      {selectionOptions.map((option) => {
        return (
          <Button
            key={option}
            variant={selected === option ? "secondary" : "outline"}
            className="mr-2 mb-4 cursor-pointer"
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
      <Table>
        <TableCaption>A list of appointments.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctorAppointments.map((appointment, index) => {
            const patient = patients.find(
              (pat) => pat.id === appointment.patient_id
            );

            return (
              <TableRow
                key={appointment.id}
                style={{
                  cursor: "pointer",
                  backgroundColor: index % 2 === 0 ? "" : "#f9f9f9",
                }}
                onClick={() => navigate(`/appointment/${appointment.id}`)}
              >
                <TableCell>
                  {patient.first_name} {patient.last_name}
                </TableCell>
                <TableCell>
                  {new Date(
                    appointment.appointment_date * 1000
                  ).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    ) : selected === "Prescriptions" ? (
      <Table>
        <TableCaption>A list of prescriptions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Medication</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctorPres.map((pre, index) => {
            const patient = patients.find((pat) => pat.id === pre.patient_id);

            return (
              <TableRow
                key={pre.id}
                style={{
                  cursor: "pointer",
                  backgroundColor: index % 2 === 0 ? "" : "#f9f9f9",
                }}
                onClick={() => navigate(`/prescription/${pre.id}`)}
              >
                <TableCell>{pre.medication}</TableCell>
                <TableCell>{pre.dosage}</TableCell>
                <TableCell>
                  {patient.first_name} {patient.last_name}
                </TableCell>
                <TableCell>
                  {new Date(pre.start_date * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(pre.end_date * 1000).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    ) : (
      <></>
    );

  console.log("Doctor data: ", doctor);

  return doctor.length !== 0 ? (
    <>
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-4 mr-auto">
        Back
      </Button>
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
        <CardFooter>
          <Button
            onClick={() => navigate(`/doctor/edit/${doctor.id}`)}
            variant="outline"
            className="w-full"
          >
            Edit
          </Button>
        </CardFooter>
      </Card>
      {Selector}
      {selection}
    </>
  ) : (
    <Loader name="doctor" />
  );
}
