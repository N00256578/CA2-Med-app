import { useEffect, useMemo, useState } from "react";
import axios from "@/config/api";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import DeleteBtn from "@/components/DeleteBtn";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { Pencil } from "lucide-react";
import { SortableHeader } from "@/components/SortableTable";
import { sortData } from "@/utils/sortData";
import { TabSelector } from "@/components/TabSelector";
import { useSortColumn } from "@/hooks/useSortColumn";

export default function Show() {
  const location = useLocation();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const { patients, appointments, prescriptions, doctors, refreshDoctors } =
    useData();
  const { token } = useAuth();
  const [selected, setSelected] = useState("Appointments");
  const { sortColumn, setSortColumn, changeSortOrder } = useSortColumn();

  const { id } = location.state ?? { id: null };

  useEffect(() => {
    let doctorId = id;
    if (id === null) {
      if (!doctors.length) return;

      doctorId = doctors.find(
        (doc) =>
          `${doc.first_name}-${doc.last_name}` ===
          location.pathname.split("/").pop()
      )?.id;
    }

    if (!doctorId) return;

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
        setDoctor(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDoctor();
  }, [doctors, id, token, location.pathname]);

  const doctorAppointments = useMemo(() => {
    if (!doctor) return [];
    return appointments.filter((app) => app.doctor_id === doctor.id);
  }, [appointments, doctor]);

  const patientList = useMemo(
    () => new Set(doctorAppointments.map((app) => app.patient_id)),
    [doctorAppointments]
  );
  const patientsById = useMemo(() => {
    const map = new Map();
    patients.forEach((p) => map.set(p.id, p));
    return map;
  }, [patients]);

  const doctorPatients = useMemo(() => {
    const result = patients.filter((pat) => patientList.has(pat.id));

    const comparators = {
      name: (a, b) => a.first_name.localeCompare(b.first_name),
      birthday: (a, b) => a.date_of_birth - b.date_of_birth,
      email: (a, b) => a.email.localeCompare(b.email),
    };

    return sortData(
      result,
      sortColumn.column,
      sortColumn.ascending,
      comparators
    );
  }, [patients, patientList, sortColumn]);

  const doctorApp = useMemo(() => {
    const result = doctorAppointments.map((app) => ({
      ...app,
      patient: patientsById.get(app.patient_id),
    }));

    const comparators = {
      name: (a, b) => a.patient.first_name.localeCompare(b.patient.first_name),
      date: (a, b) => a.appointment_date - b.appointment_date,
    };

    return sortData(
      result,
      sortColumn.column,
      sortColumn.ascending,
      comparators
    );
  }, [doctorAppointments, patientsById, sortColumn]);

  const doctorPres = useMemo(() => {
    if (!doctor) return [];

    const result = prescriptions.filter((pre) => pre.doctor_id === doctor.id);

    const comparators = {
      name: (a, b) => {
        const pa = patientsById.get(a.patient_id);
        const pb = patientsById.get(b.patient_id);
        return pa.first_name.localeCompare(pb.first_name);
      },
      med: (a, b) => a.medication.localeCompare(b.medication),
      "start-date": (a, b) => a.start_date - b.start_date,
      "end-date": (a, b) => a.end_date - b.end_date,
    };
    return sortData(
      result,
      sortColumn.column,
      sortColumn.ascending,
      comparators
    );
  }, [doctor, prescriptions, patientsById, sortColumn]);

  const PatientsTable = () => (
    <Table>
      <TableCaption>A list of patients.</TableCaption>
      <TableHeader>
        <TableRow>
          <SortableHeader
            column="name"
            label="Name"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
          <SortableHeader
            column="birthday"
            label="Date of Birth"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
          <SortableHeader
            column="email"
            label="Email"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
          <TableHead>Phone number</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {doctorPatients.map((patient, index) => (
          <TableRow
            key={patient.id}
            className="cursor-pointer hover:bg-gray-100"
            style={{ backgroundColor: index % 2 === 0 ? "" : "#f9f9f9" }}
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
  );

  const AppointmentsTable = () => (
    <Table>
      <TableCaption>A list of appointments.</TableCaption>
      <TableHeader>
        <TableRow>
          <SortableHeader
            column="name"
            label="Patient"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
          <SortableHeader
            column="date"
            label="Date"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {doctorApp.map((appointment, index) => (
          <TableRow
            key={appointment.id}
            className="cursor-pointer hover:bg-gray-100"
            style={{ backgroundColor: index % 2 === 0 ? "" : "#f9f9f9" }}
            onClick={() => navigate(`/appointment/${appointment.id}`)}
          >
            <TableCell>
              {appointment.patient.first_name} {appointment.patient.last_name}
            </TableCell>
            <TableCell>
              {new Date(
                appointment.appointment_date * 1000
              ).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const PrescriptionsTable = () => (
    <Table>
      <TableCaption>A list of prescriptions.</TableCaption>
      <TableHeader>
        <TableRow>
          <SortableHeader
            column="name"
            label="Patient"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
          <SortableHeader
            column="med"
            label="Medication"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
          <TableHead>Dosage</TableHead>
          <SortableHeader
            column="start-date"
            label="Start Date"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
          <SortableHeader
            column="end-date"
            label="End Date"
            sortColumn={sortColumn}
            onClick={changeSortOrder}
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {doctorPres.map((pre, index) => {
          const patient = patientsById.get(pre.patient_id);
          return (
            <TableRow
              key={pre.id}
              className="cursor-pointer hover:bg-gray-100"
              style={{ backgroundColor: index % 2 === 0 ? "" : "#f9f9f9" }}
              onClick={() => navigate(`/prescription/${pre.id}`)}
            >
              <TableCell>
                {patient.first_name} {patient.last_name}
              </TableCell>
              <TableCell>{pre.medication}</TableCell>
              <TableCell>{pre.dosage}</TableCell>
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
  );

  const renderTable = () => {
    switch (selected) {
      case "Patients":
        return <PatientsTable />;
      case "Appointments":
        return <AppointmentsTable />;
      case "Prescriptions":
        return <PrescriptionsTable />;
      default:
        return null;
    }
  };

  const onDeleteCallback = () => {
    toast.success("Doctor deleted successfully");
    refreshDoctors();
    navigate("/doctors");
  };

  return doctor ? (
    <>
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        className="mb-4 mr-auto"
      >
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
          <div className="flex gap-2 ml-auto">
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
            />{" "}
          </div>
        </CardFooter>
      </Card>
      <TabSelector
        options={["Appointments", "Patients", "Prescriptions"]}
        selected={selected}
        onSelect={setSelected}
        onSelectCallback={() =>
          setSortColumn({ column: "name", ascending: true })
        }
      />
      {renderTable()}
    </>
  ) : (
    <Loader name="doctor" />
  );
}
