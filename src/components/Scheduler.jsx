import { DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import axios from "@/config/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Scheduler = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      const options = {
        method: "GET",
        url: "/doctors",
      };
      try {
        let response = await axios.request(options);
        console.log("Doctors: ", response.data);
        setDoctors(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    const fetchAppointments = async () => {
      const options = {
        method: "GET",
        url: "/appointments",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        let response = await axios.request(options);
        console.log("Appointments: ", response.data);
        setAppointments(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDoctors();
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  useEffect(() => {
    const processAppointments = async () => {
      if (appointments.length === 0) return;

      const eventPromises = appointments.map(async (appointment) => {
        try {
          const appOpp = {
            method: "GET",
            url: `/patients/${appointment.patient_id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          let patientResponse = await axios.request(appOpp);
          let patient = patientResponse.data;
          let date = new Date(appointment.appointment_date * 1000);

          return {
            id: appointment.id,
            text: `${patient.first_name} ${patient.last_name}`,
            start: new Date(date).toISOString(),
            end: new Date(date.getTime() + 3600000).toISOString(), // +1 hour
            resource: appointment.doctor_id,
          };
        } catch (err) {
          console.error("Error fetching patient:", err);
          // Return a fallback event if patient fetch fails
          let date = new Date(appointment.appointment_date * 1000);
          return {
            id: appointment.id,
            text: "Appointment",
            start: new Date(date).toISOString(),
            end: new Date(date.getTime() + 3600000).toISOString(),
            resource: appointment.doctor_id,
          };
        }
      });

      const resolvedEvents = await Promise.all(eventPromises);
      setEvents(resolvedEvents);
    };

    processAppointments();
  }, [appointments, token]);

  const config = {
    timeHeaders: [
      { groupBy: "Month" },
      { groupBy: "Day", format: "d" },
      { groupBy: "Hour" },
    ],
    scale: "CellDuration",
    days: 7,
    startDate: new Date().toISOString().split("T")[0],
    cellDuration: 60, // 1440 minutes = 1 day
    cellWidthSpec: "Auto",
    resources: doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.first_name + " " + doctor.last_name,
    })),
    events: events,
  };
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <DayPilotScheduler {...config} />
    </div>
  );
};

export default Scheduler;
