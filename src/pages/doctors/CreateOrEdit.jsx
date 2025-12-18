import { getById } from "@/api";
import AsyncData from "@/components/AsyncData";
import DoctorForm from "@/components/forms/DoctorForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router";
import useSWR from "swr";

const CreateOrEditDoctor = () => {
  const { id } = useParams();

  const {
    data: doctor,
    isLoading: loadingDoctor,
    error: errorDoctor,
  } = useSWR(id ? `doctors/${id}` : null, getById);

  return (
    <AsyncData error={errorDoctor} loading={loadingDoctor}>
      <Card className="w-full max-w-2xl p-6">
        <CardHeader>
          <CardTitle>{id ? "Update" : "Create a new"} Doctor</CardTitle>
        </CardHeader>
        <CardContent>
          <DoctorForm doctor={doctor} />
        </CardContent>
      </Card>
    </AsyncData>
  );
};

export default CreateOrEditDoctor;
