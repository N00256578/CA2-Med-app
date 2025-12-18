import { DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import { useMemo } from "react";
import useSWR from "swr";
import { getAll } from "@/api";
import AsyncData from "./AsyncData";

const Scheduler = () => {
  const {
    data: doctors = [],
    isLoading: doctorsLoading,
    error: doctorsError,
  } = useSWR("doctors", getAll);

  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useSWR("appointments", getAll);

  const {
    data: patients = [],
    isLoading: patientsLoading,
    error: patientsError,
  } = useSWR("patients", getAll);

  const events = useMemo(() => {
    if (!appointments.length || !patients.length) return [];

    return appointments.map((appointment) => {
      const patient = patients.find((p) => p.id === appointment.patient_id);
      let date = new Date(appointment.appointment_date * 1000);

      return {
        id: appointment.id,
        text: `${patient.first_name} ${patient.last_name}`,
        start: new Date(date).toISOString(),
        end: new Date(date.getTime() + 3600000).toISOString(), // +1 hour
        resource: appointment.doctor_id,
      };
    });
  }, [appointments, patients]);

  const config = useMemo(
    () => ({
      timeHeaders: [
        { groupBy: "Day", format: "d MMMM yyyy" },
        { groupBy: "Hour" },
      ],
      scale: "CellDuration",
      days: 1,
      startDate: new Date().toISOString().split("T")[0],
      cellDuration: 60,
      cellWidth: 67.5,
      resources: doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.first_name + " " + doctor.last_name,
      })),
      events: events,
      eventResizeHandling: "Disabled",
      eventMoveHandling: "Disabled",
      onEventClick: (args) => {
        alert(`Link to event: ${args.e.data.id}`);
      },
    }),
    [doctors, events]
  );

  return (
    <AsyncData
      loading={doctorsLoading || appointmentsLoading || patientsLoading}
      error={doctorsError || appointmentsError || patientsError}
    >
      <div style={{ height: "500px", width: "100%" }}>
        <DayPilotScheduler {...config} />
      </div>
    </AsyncData>
  );
};

export default Scheduler;
