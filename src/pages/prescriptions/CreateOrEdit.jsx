import { getById } from "@/api";
import AsyncData from "@/components/AsyncData";
import PrescriptionForm from "@/components/forms/PrescriptionForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "react-router";
import useSWR from "swr";

export default function CreateOrEdit() {
  const { id, pres, diag } = useParams();

  const {
    data: prescription,
    isLoading: loadingPrescription,
    error: errorPrescription,
  } = useSWR(pres ? `prescriptions/${pres}` : null, getById);

  const {
    data: patient,
    isLoading: loadingPatient,
    error: errorPatient,
  } = useSWR(`patients/${id ?? prescription?.patient_id}`, getById);

  const {
    data: diagnosis,
    isLoading: loadingDiagnosis,
    error: errorDiagnosis,
  } = useSWR(`diagnoses/${diag ?? prescription?.diagnosis_id}`, getById);

  return (
    <AsyncData
      error={errorPrescription || errorPatient || errorDiagnosis}
      loading={loadingPrescription || loadingPatient || loadingDiagnosis}
    >
      <Card className="w-full max-w-2xl p-6">
        <CardHeader>
          <CardTitle>{pres ? "Update" : "Add"} Prescription</CardTitle>
          <CardDescription>
            {patient && diagnosis && (
              <div>
                Patient: {patient.first_name} {patient.last_name}
                <br />
                Diagnosis: {diagnosis.condition}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrescriptionForm
            prescription={prescription}
            patientId={id ?? patient.id}
            diagnosisId={diag ?? diagnosis.id}
          />
        </CardContent>
      </Card>
    </AsyncData>
  );
}
