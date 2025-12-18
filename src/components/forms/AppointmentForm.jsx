import { Field, Form, Formik } from "formik";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { save, getAll } from "@/api";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import AsyncData from "../AsyncData";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

export default function AppointmentForm({ appointment }) {
  const navigate = useNavigate();
  const [specFilter, setSpecFilter] = useState(new Set());

  const {
    data: doctors = [],
    isLoading: loadingDoctors,
    error: errorDoctors,
  } = useSWR("doctors", getAll);

  const {
    data: patients = [],
    isLoading: loadingPatients,
    error: errorPatients,
  } = useSWR("patients", getAll);

  const { trigger: saveAppointment, isMutating } = useSWRMutation(
    "appointments",
    save
  );

  // Get unique specialisations
  const specialisations = useMemo(() => {
    return Array.from(
      new Set(doctors.map((d) => d.specialisation).filter(Boolean))
    ).sort();
  }, [doctors]);

  // Filter doctors by specialisation
  const filteredDoctors = useMemo(() => {
    if (specFilter.size === 0) return doctors;
    return doctors.filter((d) => specFilter.has(d.specialisation));
  }, [doctors, specFilter]);

  // Group doctors by specialisation for better dropdown
  const doctorsBySpec = useMemo(() => {
    const grouped = {};
    filteredDoctors.forEach((doctor) => {
      const spec = doctor.specialisation || "Other";
      if (!grouped[spec]) {
        grouped[spec] = [];
      }
      grouped[spec].push(doctor);
    });
    return grouped;
  }, [filteredDoctors]);

  const toggleSpec = (spec) => {
    setSpecFilter((prev) => {
      const next = new Set(prev);
      if (next.has(spec)) {
        next.delete(spec);
      } else {
        next.add(spec);
      }
      return next;
    });
  };

  const AppointmentSchema = Yup.object().shape({
    appointment_date: Yup.date()
      .required("Appointment date is required")
      .test(
        "not-in-past",
        "Appointment date cannot be in the past",
        function (value) {
          if (!value) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset to start of day
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0); // Reset to start of day
          return selectedDate >= today;
        }
      ),
    appointment_time: Yup.string()
      .required("Appointment time is required")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format")
      .test(
        "not-in-past",
        "Appointment time cannot be in the past",
        function (value) {
          const { appointment_date } = this.parent;
          if (!appointment_date || !value) return true;

          const selectedDate = new Date(appointment_date);
          const today = new Date();

          // Only validate time if date is today
          if (
            selectedDate.getDate() === today.getDate() &&
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getFullYear() === today.getFullYear()
          ) {
            const [hours, minutes] = value.split(":").map(Number);
            const selectedTime = hours * 60 + minutes;
            const currentTime = today.getHours() * 60 + today.getMinutes();
            return selectedTime > currentTime;
          }

          return true; // Future dates are always valid
        }
      ),
    doctor_id: Yup.number().required("Doctor is required"),
    patient_id: Yup.number().required("Patient is required"),
  });

  const handleSubmit = async (values) => {
    try {
      const dateTime = new Date(
        `${values.appointment_date} ${values.appointment_time}`
      );

      await saveAppointment({
        id: appointment?.id ?? null,
        appointment_date: dateTime,
        doctor_id: Number(values.doctor_id),
        patient_id: Number(values.patient_id),
      });

      navigate("/appointments", {
        state: {
          type: "success",
          message: `Appointment ${
            appointment ? "updated" : "created"
          } successfully`,
        },
      });
    } catch (err) {
      console.error("Error saving appointment:", err);
    }
  };

  const getInitialDateTime = () => {
    if (!appointment?.appointment_date) {
      return { date: "", time: "" };
    }
    const dateTime = new Date(appointment.appointment_date * 1000);
    return {
      date: dateTime.toISOString().split("T")[0],
      time: dateTime.toTimeString().slice(0, 5),
    };
  };

  const initialDateTime = getInitialDateTime();

  return (
    <AsyncData
      loading={loadingDoctors || loadingPatients}
      error={errorDoctors || errorPatients}
    >
      <Formik
        enableReinitialize
        initialValues={{
          appointment_date: initialDateTime.date,
          appointment_time: initialDateTime.time,
          doctor_id: appointment?.doctor_id || "",
          patient_id: appointment?.patient_id || "",
        }}
        onSubmit={handleSubmit}
        validationSchema={AppointmentSchema}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="flex flex-col gap-6">
              {/* Date Input */}
              <div className="grid gap-2">
                <label htmlFor="appointment_date">Appointment Date</label>
                <Field
                  type="date"
                  id="appointment_date"
                  name="appointment_date"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.appointment_date && touched.appointment_date && (
                  <div className="text-red-500 text-sm">
                    {errors.appointment_date}
                  </div>
                )}
              </div>

              {/* Time Input */}
              <div className="grid gap-2">
                <label htmlFor="appointment_time">Appointment Time</label>
                <Field
                  type="time"
                  id="appointment_time"
                  name="appointment_time"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.appointment_time && touched.appointment_time && (
                  <div className="text-red-500 text-sm">
                    {errors.appointment_time}
                  </div>
                )}
              </div>

              {/* Doctor Select with Filter */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="doctor_id">Doctor</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        Filter by Specialisation
                        {specFilter.size > 0 && (
                          <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {specFilter.size}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Specialisations</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {specialisations.map((spec) => (
                        <DropdownMenuCheckboxItem
                          key={spec}
                          checked={specFilter.has(spec)}
                          onCheckedChange={() => toggleSpec(spec)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {spec}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {specFilter.size > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => setSpecFilter(new Set())}
                          >
                            Clear filters
                          </Button>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Field
                  as="select"
                  id="doctor_id"
                  name="doctor_id"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a Doctor</option>
                  {Object.keys(doctorsBySpec)
                    .sort()
                    .map((spec) => (
                      <optgroup key={spec} label={spec}>
                        {doctorsBySpec[spec].map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.first_name} {doctor.last_name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </Field>
                {errors.doctor_id && touched.doctor_id && (
                  <div className="text-red-500 text-sm">{errors.doctor_id}</div>
                )}
                {filteredDoctors.length === 0 && specFilter.size > 0 && (
                  <div className="text-yellow-600 text-sm">
                    No doctors found with selected specialisations
                  </div>
                )}
              </div>

              {/* Patient Select */}
              <div className="grid gap-2">
                <label htmlFor="patient_id">Patient</label>
                <Field
                  as="select"
                  id="patient_id"
                  name="patient_id"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a Patient</option>
                  {patients
                    .sort((a, b) => a.first_name.localeCompare(b.first_name))
                    .map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                </Field>
                {errors.patient_id && touched.patient_id && (
                  <div className="text-red-500 text-sm">
                    {errors.patient_id}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="outline"
                className="mt-4 cursor-pointer"
                disabled={isMutating || isSubmitting}
              >
                {isMutating || isSubmitting
                  ? "Saving..."
                  : appointment
                  ? "Update"
                  : "Create"}{" "}
                Appointment
              </Button>

              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate(-1)}
                disabled={isMutating || isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </AsyncData>
  );
}
