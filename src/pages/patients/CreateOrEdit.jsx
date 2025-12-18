import { getById } from "@/api";
import AsyncData from "@/components/AsyncData";
import PatientForm from "@/components/forms/PatientForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router";
import useSWR from "swr";

const CreateOrEditPatient = () => {
  const { id } = useParams();

  const {
    data: patient,
    isLoading: loadingPatient,
    error: errorPatient,
  } = useSWR(id ? `patients/${id}` : null, getById);

  return (
    <AsyncData error={errorPatient} loading={loadingPatient}>
      <Card className="w-full max-w-2xl p-6">
        <CardHeader>
          <CardTitle>{id ? "Update" : "Create a new"} Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientForm patient={patient} />
        </CardContent>
      </Card>
    </AsyncData>
  );
};

export default CreateOrEditPatient;
