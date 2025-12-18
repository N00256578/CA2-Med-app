import { deleteById, getAll, getById } from "@/api";
import AsyncData from "@/components/AsyncData";
import ConfirmDelete from "@/components/ConfirmDelete";
import DataTable from "@/components/DataTable";
import { TabSelector } from "@/components/TabSelector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSortColumn } from "@/hooks/useSortColumn";
import { sortData } from "@/utils/sortData";
import { IconBodyScan, IconPillFilled } from "@tabler/icons-react";
import { Pencil, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

export default function Show() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("Appointments");
  const { sortColumn, setSortColumn, changeSortOrder } = useSortColumn();

  const id = Number(slug.split("-").pop());

  const { trigger: deletePatient, error: deleteError } = useSWRMutation(
    "patients",
    deleteById
  );

  const { trigger: deleteAppointment, error: deleteAppError } = useSWRMutation(
    "appointments",
    deleteById
  );
  const { trigger: deleteDiagnosis, error: deleteDiagError } = useSWRMutation(
    "diagnoses",
    deleteById
  );
  const { trigger: deletePrescription, error: deletePresError } =
    useSWRMutation("prescriptions", deleteById);

  const {
    data: patient,
    isLoading: loadingPatient,
    error: errorPatient,
  } = useSWR(`patients/${id}`, getById);

  const {
    data: appointments = [],
    isLoading: loadingAppointments,
    error: errorAppointments,
  } = useSWR("appointments", getAll);
  const {
    data: doctors = [],
    isLoading: loadingDoctors,
    error: errorDoctors,
  } = useSWR("doctors", getAll);
  const {
    data: diagnoses = [],
    isLoading: loadingDiagnoses,
    error: errorDiagnoses,
  } = useSWR("diagnoses", getAll);
  const {
    data: prescriptions = [],
    isLoading: loadingPrescriptions,
    error: errorPrescriptions,
  } = useSWR("prescriptions", getAll);

  // Build doctorsById lookup map
  const doctorsById = useMemo(() => {
    const map = new Map();
    doctors.forEach((d) => map.set(d.id, d));
    return map;
  }, [doctors]);

  const diagnosesById = useMemo(() => {
    const map = new Map();
    diagnoses.forEach((d) => map.set(d.id, d));
    return map;
  }, [diagnoses]);

  // Filter patient's appointments
  const patientAppointments = useMemo(() => {
    return appointments.filter((app) => app.patient_id === id);
  }, [id, appointments]);

  const handleDeleteDiagnosis = async (diagnosisId) => {
    try {
      // Check if there are related prescriptions
      const relatedPrescriptions = prescriptions.filter(
        (pre) => pre.diagnosis_id === diagnosisId
      );

      if (relatedPrescriptions.length > 0) {
        // Show warning toast and prevent deletion
        toast.error(
          `Cannot delete diagnosis. Please delete ${
            relatedPrescriptions.length
          } related prescription${
            relatedPrescriptions.length > 1 ? "s" : ""
          } first.`,
          {
            duration: 5000,
          }
        );
        return;
      }

      // No related prescriptions, safe to delete
      await deleteDiagnosis(diagnosisId);
      toast.success("Diagnosis deleted successfully");
    } catch (err) {
      console.error("Error deleting diagnosis:", err);
      toast.error("Failed to delete diagnosis");
    }
  };

  // Get sorted table data based on selected tab
  const { tableData, tableConfig } = useMemo(() => {
    const configs = {
      Appointments: {
        data: patientAppointments
          .map((app) => ({
            ...app,
            doctor: doctorsById.get(app.doctor_id),
          }))
          .filter((app) => app.doctor),
        comparators: {
          name: (a, b) =>
            a.doctor.first_name.localeCompare(b.doctor.first_name),
          date: (a, b) => a.appointment_date - b.appointment_date,
        },
        columns: [
          {
            key: "name",
            label: "Doctor",
            sortable: true,
            render: (row) => `${row.doctor.first_name} ${row.doctor.last_name}`,
            onClick: (row) =>
              navigate(
                `/doctors/${row.doctor.first_name}-${row.doctor.last_name}-${row.doctor.id}`
              ),
          },
          {
            key: "date",
            label: "Date",
            sortable: true,
            render: (row) =>
              new Date(row.appointment_date * 1000).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              ),
          },
          {
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
                    navigate(`/appointments/${row.id}/edit`);
                  }}
                >
                  <Pencil />
                </Button>
                <ConfirmDelete
                  title="Delete appointment"
                  description="This appointment will be permanently removed."
                  onConfirm={(e) => {
                    e.stopPropagation();
                    deleteAppointment(row.id);
                    toast.success("Appointment deleted successfully");
                  }}
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
            ),
          },
        ],
        caption: "A list of appointments.",
        // onRowClick: (row) =>
        //   `/doctors/${row.doctor.first_name}-${row.doctor.last_name}-${row.doctor.id}`,
      },
      Doctors: {
        data: doctors.filter((doc) =>
          patientAppointments.some((app) => app.doctor_id === doc.id)
        ),
        comparators: {
          name: (a, b) => a.first_name.localeCompare(b.first_name),
          specialisation: (a, b) =>
            a.specialisation.localeCompare(b.specialisation),
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
            key: "specialisation",
            label: "Specialisation",
            sortable: true,
            render: (row) => row.specialisation,
          },
          { key: "email", label: "Email", sortable: true },
          { key: "phone", label: "Phone number", sortable: false },
        ],
        caption: "A list of doctors.",
        onRowClick: (row) =>
          `/doctors/${row.first_name}-${row.last_name}-${row.id}`,
      },
      Diagnoses: {
        data: diagnoses.filter((diag) => diag.patient_id === patient?.id),
        comparators: {
          name: (a, b) => a.condition.localeCompare(b.condition),
          date: (a, b) => a.diagnosis_date - b.diagnosis_date,
        },
        columns: [
          {
            key: "name",
            label: "Name",
            sortable: true,
            render: (row) => row.condition,
          },
          {
            key: "date",
            label: "Diagnosis Date",
            sortable: true,
            render: (row) =>
              new Date(row.diagnosis_date * 1000).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
          },
          {
            key: "actions",
            label: "",
            sortable: false,
            render: (row) => (
              <div className="flex gap-2 justify-end">
                <Button asChild variant="outline">
                  <Link
                    to={`/patients/${patient.id}/diagnoses/${row.id}/prescriptions/create`}
                  >
                    <IconPillFilled />
                    Add Prescription
                  </Link>
                </Button>
                <Button
                  className="cursor-pointer hover:border-blue-500"
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patients/${id}/diagnoses/${row.id}`);
                  }}
                >
                  <Pencil />
                </Button>
                <ConfirmDelete
                  title="Delete diagnosis"
                  description="This diagnosis will be permanently removed."
                  onConfirm={(e) => {
                    e.stopPropagation();
                    handleDeleteDiagnosis(row.id);
                  }}
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
            ),
          },
        ],
        caption: "A list of diagnoses.",
      },
      Prescriptions: {
        data: prescriptions
          .filter((pre) => pre.patient_id === patient?.id)
          .filter((pre) => doctorsById.has(pre.doctor_id)),
        comparators: {
          med: (a, b) => a.medication.localeCompare(b.medication),
          "start-date": (a, b) => a.start_date - b.start_date,
          "end-date": (a, b) => a.end_date - b.end_date,
        },
        columns: [
          {
            key: "doctor",
            label: "Doctor",
            sortable: true,
            render: (row) => {
              const doctor = doctorsById.get(row.doctor_id);
              return doctor
                ? `${doctor.first_name} ${doctor.last_name}`
                : "Unknown";
            },
          },
          {
            key: "diagnosis",
            label: "Diagnosis",
            sortable: true,
            render: (row) => {
              const diagnosis = diagnosesById.get(row.diagnosis_id);
              return diagnosis ? diagnosis.condition : "Unknown";
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
            render: (row) =>
              new Date(row.end_date * 1000).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
          },
          {
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
                    navigate(`/prescriptions/${row.id}`);
                  }}
                >
                  <Pencil />
                </Button>
                <ConfirmDelete
                  title="Delete prescription"
                  description="This prescription will be permanently removed."
                  onConfirm={(e) => {
                    e.stopPropagation();
                    deletePrescription(row.id);
                    toast.success("Prescription deleted successfully");
                  }}
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
            ),
          },
        ],
        caption: "A list of prescriptions.",
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
    patientAppointments,
    doctors,
    prescriptions,
    diagnoses,
    patient,
    doctorsById,
    navigate,
    deleteAppointment,
  ]);

  const onDeleteCallback = (id) => {
    deletePatient(id);
    toast.success("Patient deleted successfully");
    navigate("/patients");
  };

  const isLoading =
    loadingPatient ||
    loadingDoctors ||
    loadingAppointments ||
    loadingDiagnoses ||
    loadingPrescriptions;
  const hasError =
    errorPatient ||
    errorDoctors ||
    errorAppointments ||
    errorDiagnoses ||
    errorPrescriptions ||
    deleteDiagError ||
    deletePresError ||
    deleteAppError ||
    deleteError;

  return (
    <AsyncData loading={isLoading} error={hasError}>
      {!patient ? (
        <div>Patient not found</div>
      ) : (
        <>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4 mr-auto"
          >
            Back
          </Button>

          <div className="flex gap-4 items-start mb-6">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {patient.first_name} {patient.last_name}
                </CardTitle>
                <CardDescription>
                  {new Date(patient.date_of_birth * 1000).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Email:{" "}
                  <a
                    href={`mailto:${patient.email}`}
                    className="hover:text-blue-900 hover:underline cursor-pointer"
                  >
                    {patient.email}
                  </a>
                </p>

                <p className="mb-2">
                  Phone:{" "}
                  <a
                    href={`tel:${patient.phone}`}
                    className="hover:text-blue-900 hover:underline cursor-pointer"
                  >
                    {patient.phone}
                  </a>
                </p>
                <p className="mb-2">Address: {patient.address}</p>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 ml-auto">
                  <Button
                    className="cursor-pointer hover:border-blue-500"
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/patients/${patient.id}/edit`)}
                  >
                    <Pencil />
                  </Button>
                  <ConfirmDelete
                    title="Delete patient"
                    description="This patient will be permanently removed."
                    onConfirm={() => onDeleteCallback(patient.id)}
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
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link to={`/patients/${patient.id}/diagnoses/create`}>
                  <IconBodyScan />
                  Add Diagnosis
                </Link>
              </Button>
            </div>
          </div>

          <TabSelector
            options={["Appointments", "Doctors", "Diagnoses", "Prescriptions"]}
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
