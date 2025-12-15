import { useAuth } from "@/hooks/useAuth";
import axios from "@/config/api";
import { createContext, useContext, useEffect, useState } from "react";
import { getAll } from "@/api";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctors = await getAll("doctors");
      setDoctors(doctors);
    };

    const fetchPatients = async () => {
      const patients = await getAll("patients");
      setPatients(patients);
    };

    fetchDoctors();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchProtectedData = async () => {
      setLoading(true);
      try {
        const [appointmentsRes, diagnosesRes, prescriptionsRes] =
          await Promise.all([
            axios.get("/appointments", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/diagnoses", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/prescriptions", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setAppointments(appointmentsRes.data);
        setDiagnoses(diagnosesRes.data);
        setPrescriptions(prescriptionsRes.data);
      } catch (err) {
        console.log("Error fetching data: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProtectedData();
  }, [token]);

  const refreshDoctors = async () => {
    try {
      const response = await getAll("doctors");
      setDoctors(response);
    } catch (err) {
      console.error("Error refreshing doctors:", err);
    }
  };

  const refreshPatients = async () => {
    if (!token) return;
    try {
      const response = await getAll("patients");
      setPatients(response);
    } catch (err) {
      console.error("Error refreshing patients:", err);
    }
  };

  const refreshAppointments = async () => {
    if (!token) return;
    try {
      const response = await axios.get("/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
    } catch (err) {
      console.error("Error refreshing appointments:", err);
    }
  };
  return (
    <DataContext.Provider
      value={{
        doctors,
        patients,
        appointments,
        diagnoses,
        prescriptions,
        loading,
        refreshDoctors,
        refreshPatients,
        refreshAppointments,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
export { DataContext };
