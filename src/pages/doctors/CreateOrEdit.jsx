import { getById } from "@/api";
import DoctorForm from "@/components/forms/DoctorForm";
import Loader from "@/components/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const CreateOrEditDoctor = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const { loading } = useData();

  useEffect(() => {
    const fetchDoctor = async () => {
      const response = await getById("doctors", id);
      console.log("Doctor: ", response);
      setDoctor(response);
    };
    if (id) {
      fetchDoctor();
    }
  }, [id]);

  return (
    <Card className="w-full max-w-2xl p-6">
      <CardHeader>
        <CardTitle>{id ? "Update" : "Create a new"} Doctor</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader name="doctor" />
        ) : (
          <DoctorForm doctor={doctor} />
        )}
      </CardContent>
    </Card>
  );
};

export default CreateOrEditDoctor;
