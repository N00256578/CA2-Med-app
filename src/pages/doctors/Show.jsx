import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import { Pencil, Trash } from "lucide-react";
import { sortData } from "@/utils/sortData";
import { TabSelector } from "@/components/TabSelector";
import { useSortColumn } from "@/hooks/useSortColumn";
import { deleteById, getAll, getById } from "@/api";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import AsyncData from "@/components/AsyncData";
import DataTable from "@/components/DataTable";
import ConfirmDelete from "@/components/ConfirmDelete";

export default function Show() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("Appointments");
  const { sortColumn, setSortColumn, changeSortOrder } = useSortColumn();

  const id = Number(slug.split("-").pop());

  const { trigger: deleteDoctor, error: deleteError } = useSWRMutation(
    "doctors",
    deleteById
  );

  const {
    data: doctor,
    isLoading: loadingDoctor,
    error: errorDoctor,
  } = useSWR(`doctors/${id}`, getById);
  const {
    data: appointments = [],
    isLoading: loadingAppointments,
    error: errorAppointments,
  } = useSWR("appointments", getAll);
  const {
    data: patients = [],
    isLoading: loadingPatients,
    error: errorPatients,
  } = useSWR("patients", getAll);
  const {
    data: prescriptions = [],
    isLoading: loadingPrescriptions,
    error: errorPrescriptions,
  } = useSWR("prescriptions", getAll);

  // Build patientsById lookup map
  const patientsById = useMemo(() => {
    const map = new Map();
    patients.forEach((p) => map.set(p.id, p));
    return map;
  }, [patients]);

  // Filter doctor's appointments
  const doctorAppointments = useMemo(() => {
    return appointments.filter((app) => app.doctor_id === id);
  }, [id, appointments]);

  // Get sorted table data based on selected tab
  const { tableData, tableConfig } = useMemo(() => {
    const configs = {
      Appointments: {
        data: doctorAppointments
          .map((app) => ({
            ...app,
            patient: patientsById.get(app.patient_id),
          }))
          .filter((app) => app.patient),
        comparators: {
          name: (a, b) =>
            a.patient.first_name.localeCompare(b.patient.first_name),
          date: (a, b) => a.appointment_date - b.appointment_date,
        },
        columns: [
          {
            key: "name",
            label: "Patient",
            sortable: true,
            render: (row) =>
              `${row.patient.first_name} ${row.patient.last_name}`,
          },
          {
            key: "date",
            label: "Date",
            sortable: true,
            render: (row) =>
              new Date(row.appointment_date * 1000).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          },
        ],
        caption: "A list of appointments.",
        onRowClick: (row) => `/appointment/${row.id}`,
      },
      Patients: {
        data: patients.filter((pat) =>
          doctorAppointments.some((app) => app.patient_id === pat.id)
        ),
        comparators: {
          name: (a, b) => a.first_name.localeCompare(b.first_name),
          birthday: (a, b) => a.date_of_birth - b.date_of_birth,
          email: (a, b) => a.email.localeCompare(b.email),
        },
        columns: [
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
        ],
        caption: "A list of patients.",
        onRowClick: (row) =>
          `/patients/${row.first_name}-${row.last_name}-${row.id}`,
      },
      Prescriptions: {
        data: prescriptions
          .filter((pre) => pre.doctor_id === doctor?.id)
          .filter((pre) => patientsById.has(pre.patient_id)),
        comparators: {
          name: (a, b) => {
            const pa = patientsById.get(a.patient_id);
            const pb = patientsById.get(b.patient_id);
            return pa.first_name.localeCompare(pb.first_name);
          },
          med: (a, b) => a.medication.localeCompare(b.medication),
          "start-date": (a, b) => a.start_date - b.start_date,
          "end-date": (a, b) => a.end_date - b.end_date,
        },
        columns: [
          {
            key: "name",
            label: "Patient",
            sortable: true,
            render: (row) => {
              const patient = patientsById.get(row.patient_id);
              return `${patient.first_name} ${patient.last_name}`;
            },
          },
          {
            key: "med",
            label: "Medication",
            sortable: true,
            render: (row) => row.medication,
          },
          { key: "dosage", label: "Dosage", sortable: false },
          {
            key: "start-date",
            label: "Start Date",
            sortable: true,
            render: (row) =>
              new Date(row.start_date * 1000).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          },
          {
            key: "end-date",
            label: "End Date",
            sortable: true,
            render: (row) => new Date(row.end_date * 1000).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          },
        ],
        caption: "A list of prescriptions.",
        onRowClick: (row) => `/prescription/${row.id}`,
      },
    };

    const config = configs[selected];
    const sortedData = sortData(
      config.data,
      sortColumn.column,
      sortColumn.ascending,
      config.comparators
    );

    return { tableData: sortedData, tableConfig: config };
  }, [
    selected,
    sortColumn,
    doctorAppointments,
    patients,
    prescriptions,
    doctor,
    patientsById,
  ]);

  const onDeleteCallback = (id) => {
    deleteDoctor(id);
    toast.success("Doctor deleted successfully");
    navigate("/doctors");
  };

  const isLoading =
    loadingDoctor ||
    loadingAppointments ||
    loadingPatients ||
    loadingPrescriptions;
  const hasError =
    errorDoctor ||
    errorAppointments ||
    errorPatients ||
    errorPrescriptions ||
    deleteError;

  return (
    <AsyncData loading={isLoading} error={hasError}>
      {!doctor ? (
        <div>Doctor not found</div>
      ) : (
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
              <p className="mb-2">
                Email:{" "}
                <a
                  href={`mailto:${doctor.email}`}
                  className="hover:text-blue-900 hover:underline cursor-pointer"
                >
                  {doctor.email}
                </a>
              </p>

              <p className="mb-2">
                Phone:{" "}
                <a
                  href={`tel:${doctor.phone}`}
                  className="hover:text-blue-900 hover:underline cursor-pointer"
                >
                  {doctor.phone}
                </a>
              </p>
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
                <ConfirmDelete
                  title="Delete doctor"
                  description="This doctor will be permanently removed."
                  onConfirm={() => onDeleteCallback(doctor.id)}
                >
                  <Button
                    className="cursor-pointer text-red-500 hover:border-red-700 hover:text-red-700"
                    variant="outline"
                    size="icon"
                  >
                    <Trash />
                  </Button>
                </ConfirmDelete>
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

          <DataTable
            data={tableData}
            columns={tableConfig.columns}
            caption={tableConfig.caption}
            sortColumn={sortColumn}
            onSort={changeSortOrder}
            onRowClick={tableConfig.onRowClick}
          />
        </>
      )}
    </AsyncData>
  );
}
