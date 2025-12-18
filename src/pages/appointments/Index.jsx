import { Button } from "@/components/ui/button";
import { useSortColumn } from "@/hooks/useSortColumn";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useSWR from "swr";
import { deleteById, getAll } from "@/api";
import AsyncData from "@/components/AsyncData";
import DataTable from "@/components/DataTable";
import { sortData } from "@/utils/sortData";
import { ChevronLeft, ChevronRight, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import ConfirmDelete from "@/components/ConfirmDelete";

export default function Index() {
  const { sortColumn, changeSortOrder } = useSortColumn();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { trigger: deleteAppointment, error: deleteError } = useSWRMutation(
    "appointments",
    deleteById
  );

  const {
    data: appointments = [],
    isLoading,
    error,
  } = useSWR("appointments", getAll);
  const { data: patients = [] } = useSWR("patients", getAll);
  const { data: doctors = [] } = useSWR("doctors", getAll);

  // Build lookup maps
  const patientsById = useMemo(() => {
    const map = new Map();
    patients.forEach((p) => map.set(p.id, p));
    return map;
  }, [patients]);

  const doctorsById = useMemo(() => {
    const map = new Map();
    doctors.forEach((d) => map.set(d.id, d));
    return map;
  }, [doctors]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const map = new Map();
    appointments.forEach((app) => {
      const date = new Date(app.appointment_date * 1000);
      const dateKey = date.toISOString().split("T")[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(app);
    });
    return map;
  }, [appointments]);

  // Get appointments for selected date
  const { tableData, tableConfig } = useMemo(() => {
    const dateKey = selectedDate.toISOString().split("T")[0];
    let dayAppointments = appointmentsByDate.get(dateKey) || [];

    // Add patient and doctor info
    const enriched = dayAppointments
      .map((app) => ({
        ...app,
        patient: patientsById.get(app.patient_id),
        doctor: doctorsById.get(app.doctor_id),
      }))
      .filter((app) => app.patient && app.doctor);

    const comparators = {
      time: (a, b) => a.appointment_date - b.appointment_date,
      patient: (a, b) =>
        a.patient.first_name.localeCompare(b.patient.first_name),
      doctor: (a, b) => a.doctor.first_name.localeCompare(b.doctor.first_name),
    };

    const columns = [
      {
        key: "time",
        label: "Time",
        sortable: true,
        render: (row) =>
          new Date(row.appointment_date * 1000).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        key: "patient",
        label: "Patient",
        sortable: true,
        render: (row) => `${row.patient.first_name} ${row.patient.last_name}`,
        onClick: (row) => {
          navigate(
            `/patients/${row.patient.first_name}-${row.patient.last_name}-${row.patient.id}`
          );
        },
      },
      {
        key: "doctor",
        label: "Doctor",
        sortable: true,
        render: (row) => `${row.doctor.first_name} ${row.doctor.last_name}`,
        onClick: (row) => {
          console.log("Clicked doctor", row);
          navigate(
            `/doctors/${row.doctor.first_name}-${row.doctor.last_name}-${row.doctor.id}`
          );
        },
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
              onClick={() => {
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
    ];

    const sortedData = sortData(
      enriched,
      sortColumn.column,
      sortColumn.ascending,
      comparators
    );

    return {
      tableData: sortedData,
      tableConfig: {
        columns,
        caption: `Appointments for ${selectedDate.toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
      },
    };
  }, [selectedDate, appointmentsByDate, patientsById, doctorsById, sortColumn]);

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const hasAppointments = (date) => {
    if (!date) return false;
    const dateKey = date.toISOString().split("T")[0];
    return appointmentsByDate.has(dateKey);
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AsyncData loading={isLoading} error={error || deleteError}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Left Side */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={previousMonth}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold">
                {currentMonth.toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, idx) => {
                const hasAppts = hasAppointments(date);
                const selected = isSelected(date);
                const today = isToday(date);

                return (
                  <button
                    key={idx}
                    onClick={() => date && setSelectedDate(date)}
                    disabled={!date}
                    className={`
                      aspect-square p-2 text-sm rounded-md relative
                      ${!date ? "invisible" : ""}
                      ${
                        selected
                          ? "bg-blue-500 text-white font-semibold"
                          : today
                          ? "bg-blue-100 font-semibold"
                          : "hover:bg-gray-100"
                      }
                      ${!date ? "" : "cursor-pointer"}
                      transition-colors
                    `}
                  >
                    {date?.getDate()}
                    {hasAppts && (
                      <div
                        className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                          selected ? "bg-white" : "bg-blue-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Appointments List - Right Side */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/appointments/create")}
              className="cursor-pointer"
            >
              Create New Appointment
            </Button>
          </div>
          <DataTable
            data={tableData}
            columns={tableConfig.columns}
            caption={tableConfig.caption}
            sortColumn={sortColumn}
            onSort={changeSortOrder}
          />
        </div>
      </div>
    </AsyncData>
  );
}
