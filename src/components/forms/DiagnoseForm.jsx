import { Field, Form, Formik } from "formik";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { save } from "@/api";
import useSWRMutation from "swr/mutation";
import AsyncData from "../AsyncData";

export default function DiagnoseForm({ diagnose, patientId }) {
  const navigate = useNavigate();

  const { trigger: saveDiagnose, isMutating } = useSWRMutation(
    "diagnoses",
    save
  );

  const DiagnoseSchema = Yup.object().shape({
    condition: Yup.string()
      .min(2, "Condition must be at least 2 characters")
      .required("Condition is required"),
    diagnosis_date: Yup.date()
      .required("Diagnosis date is required")
      .max(new Date(), "Diagnosis date cannot be in the future"),
  });

  const handleSubmit = async (values) => {
    try {
      await saveDiagnose({
        id: diagnose?.id ?? null,
        patient_id: Number(patientId),
        condition: values.condition,
        diagnosis_date: new Date(values.diagnosis_date)
          .toISOString()
          .split("T")[0],
      });

      navigate(`/patients/${patientId}`, {
        state: {
          type: "success",
          message: `Diagnosis ${diagnose ? "updated" : "created"} successfully`,
        },
      });
    } catch (err) {
      console.error("Error saving diagnosis:", err);
    }
  };

  const getInitialDate = () => {
    if (!diagnose?.diagnosis_date) {
      return new Date().toISOString().split("T")[0];
    }
    const date = new Date(diagnose.diagnosis_date * 1000);
    return date.toISOString().split("T")[0];
  };

  return (
    <AsyncData loading={false} error={null}>
      <Formik
        enableReinitialize
        initialValues={{
          condition: diagnose?.condition || "",
          diagnosis_date: getInitialDate(),
        }}
        onSubmit={handleSubmit}
        validationSchema={DiagnoseSchema}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="flex flex-col gap-6">
              {/* Condition Input */}
              <div className="grid gap-2">
                <label htmlFor="condition">Condition</label>
                <Field
                  type="text"
                  id="condition"
                  name="condition"
                  placeholder="e.g., Hypertension, Diabetes Type 2, Asthma"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.condition && touched.condition && (
                  <div className="text-red-500 text-sm">{errors.condition}</div>
                )}
              </div>

              {/* Diagnosis Date Input */}
              <div className="grid gap-2">
                <label htmlFor="diagnosis_date">Diagnosis Date</label>
                <Field
                  type="date"
                  id="diagnosis_date"
                  name="diagnosis_date"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.diagnosis_date && touched.diagnosis_date && (
                  <div className="text-red-500 text-sm">
                    {errors.diagnosis_date}
                  </div>
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
                  : diagnose
                  ? "Update"
                  : "Create"}{" "}
                Diagnosis
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
