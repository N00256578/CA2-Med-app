import { getById } from "@/api";
import AsyncData from "@/components/AsyncData";
import DiagnoseForm from "@/components/forms/DiagnoseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router";
import useSWR from "swr";

export default function CreateOrEditDiagnoses() {
  const { id, diag } = useParams();

  const {
    data: diagnose,
    isLoading: loadingDiagnose,
    error: errorDiagnose,
  } = useSWR(diag ? `diagnoses/${diag}` : null, getById);

  return (
    <AsyncData error={errorDiagnose} loading={loadingDiagnose}>
      <Card className="w-full max-w-2xl p-6">
        <CardHeader>
          <CardTitle>{diag ? "Update" : "Add"} Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <DiagnoseForm diagnose={diagnose} patientId={id} />
        </CardContent>
      </Card>
    </AsyncData>
  );
}
