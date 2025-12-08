import { DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import axios from "@/config/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Scheduler = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
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
        // Make sure we set an array
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

  const config = {
    timeHeaders: [{ groupBy: "Month" }, { groupBy: "Day", format: "d" }],
    scale: "CellDuration",
    days: 14,
    startDate: new Date().toISOString().split("T")[0], // Today's date
    cellDuration: 1440, // 1440 minutes = 1 day
    cellWidthSpec: "Auto",
    resources: doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.first_name + " " + doctor.last_name,
    })),
    events: appointments.map((appointment) => {
      // const appOpp = {
      //   method: "GET",
      //   url: `/patients/${appointment.patient_id}`,
      // };
      // let patient = axios.request(appOpp);
      console.log(new Date(appointment.appointment_date));
      const event = {
        id: appointment.id,
        // text: patient.first_name + " " + patient.last_name,
        text: "Appointment",
        start: new Date(appointment.appointment_date).toISOString(),
        end: new Date(
          new Date(appointment.appointment_date).getDay() + 3600000
        ).toISOString(), // +1 hour
        resource: appointment.doctor_id,
      };
      return event;
    }),
  };
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <DayPilotScheduler {...config} />
    </div>
  );
};

export default Scheduler;
