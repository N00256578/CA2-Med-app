import { getById } from "@/api";
import AsyncData from "@/components/AsyncData";
import AppointmentForm from "@/components/forms/AppointmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router";
import useSWR from "swr";

const CreateOrEditAppointment = () => {
  const { id } = useParams();

  const {
    data: appointment,
    isLoading: loadingAppointment,
    error: errorAppointment,
  } = useSWR(id ? `appointments/${id}` : null, getById);

  return (
    <AsyncData error={errorAppointment} loading={loadingAppointment}>
      <Card className="w-full max-w-2xl p-6">
        <CardHeader>
          <CardTitle>{id ? "Update" : "Create a new"} Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm appointment={appointment} />
        </CardContent>
      </Card>
    </AsyncData>
  );
};

export default CreateOrEditAppointment;