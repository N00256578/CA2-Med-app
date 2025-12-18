import { Field, Form, Formik } from "formik";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { save, getAll } from "@/api";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import AsyncData from "../AsyncData";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";

export default function PrescriptionForm({
  prescription,
  patientId,
  diagnosisId,
}) {
  const navigate = useNavigate();
  const [specFilter, setSpecFilter] = useState(new Set());

  const {
    data: doctors = [],
    isLoading: loadingDoctors,
    error: errorDoctors,
  } = useSWR("doctors", getAll);

  const { trigger: savePrescription, isMutating } = useSWRMutation(
    "prescriptions",
    save
  );

  // Get unique specialisations
  const specialisations = useMemo(() => {
    return [...new Set(doctors.map((d) => d.specialisation))].sort();
  }, [doctors]);

  // Filter doctors by selected specialisations
  const filteredDoctors = useMemo(() => {
    if (specFilter.size === 0) return doctors;
    return doctors.filter((doc) => specFilter.has(doc.specialisation));
  }, [doctors, specFilter]);

  // Group doctors by specialisation
  const doctorsBySpec = useMemo(() => {
    const grouped = {};
    filteredDoctors.forEach((doc) => {
      if (!grouped[doc.specialisation]) {
        grouped[doc.specialisation] = [];
      }
      grouped[doc.specialisation].push(doc);
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

  const PrescriptionSchema = Yup.object().shape({
    medication: Yup.string()
      .min(2, "Medication must be at least 2 characters")
      .required("Medication is required"),
    dosage: Yup.string()
      .min(2, "Dosage must be at least 2 characters")
      .required("Dosage is required"),
    doctor_id: Yup.number()
      .required("Doctor is required")
      .positive("Please select a doctor"),
    start_date: Yup.date()
      .required("Start date is required")
      .max(new Date(), "Start date cannot be in the future"),
    end_date: Yup.date()
      .required("End date is required")
      .min(Yup.ref("start_date"), "End date must be after start date"),
  });

  const handleSubmit = async (values) => {
    try {
      const startDate = new Date(values.start_date);
      const endDate = new Date(values.end_date);

      const start_date = Math.floor(startDate.getTime() / 1000);
      const end_date = Math.floor(endDate.getTime() / 1000);

      await savePrescription({
        id: prescription?.id ?? null,
        diagnosis_id: Number(diagnosisId),
        doctor_id: Number(values.doctor_id),
        patient_id: Number(patientId),
        medication: values.medication,
        dosage: values.dosage,
        start_date: new Date(start_date * 1000).toISOString().split("T")[0],
        end_date: new Date(end_date * 1000).toISOString().split("T")[0],
      });

      navigate(-1, {
        state: {
          type: "success",
          message: `Prescription ${
            prescription ? "updated" : "created"
          } successfully`,
        },
      });
    } catch (err) {
      console.error("Error saving prescription:", err);
    }
  };

  const getInitialDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toISOString().split("T")[0];
  };

  return (
    <AsyncData loading={loadingDoctors} error={errorDoctors}>
      <Formik
        enableReinitialize
        initialValues={{
          medication: prescription?.medication || "",
          dosage: prescription?.dosage || "",
          doctor_id: prescription?.doctor_id || "",
          start_date:
            getInitialDate(prescription?.start_date) ||
            new Date().toISOString().split("T")[0],
          end_date: getInitialDate(prescription?.end_date) || "",
        }}
        onSubmit={handleSubmit}
        validationSchema={PrescriptionSchema}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="flex flex-col gap-6">
              {/* Medication Input */}
              <div className="grid gap-2">
                <label htmlFor="medication">Medication</label>
                <Field
                  type="text"
                  id="medication"
                  name="medication"
                  placeholder="e.g., Aspirin, Metformin, Lisinopril"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.medication && touched.medication && (
                  <div className="text-red-500 text-sm">
                    {errors.medication}
                  </div>
                )}
              </div>

              {/* Dosage Input */}
              <div className="grid gap-2">
                <label htmlFor="dosage">Dosage</label>
                <Field
                  type="text"
                  id="dosage"
                  name="dosage"
                  placeholder="e.g., 500mg twice daily, 10mg once daily"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.dosage && touched.dosage && (
                  <div className="text-red-500 text-sm">{errors.dosage}</div>
                )}
              </div>

              {/* Doctor Select with Filter */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="doctor_id">Prescribing Doctor</label>
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

              {/* Start Date Input */}
              <div className="grid gap-2">
                <label htmlFor="start_date">Start Date</label>
                <Field
                  type="date"
                  id="start_date"
                  name="start_date"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.start_date && touched.start_date && (
                  <div className="text-red-500 text-sm">
                    {errors.start_date}
                  </div>
                )}
              </div>

              {/* End Date Input */}
              <div className="grid gap-2">
                <label htmlFor="end_date">End Date</label>
                <Field
                  type="date"
                  id="end_date"
                  name="end_date"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.end_date && touched.end_date && (
                  <div className="text-red-500 text-sm">{errors.end_date}</div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="outline"
                className="mt-4 cursor-pointer"
                disabled={isMutating || isSubmitting}
              >
                {isMutating || isSubmitting
                  ? "Saving..."
                  : prescription
                  ? "Update"
                  : "Create"}{" "}
                Prescription
              </Button>

              {/* Cancel Button */}
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate(`/patients/${patientId}`)}
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
