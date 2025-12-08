import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Show() {
  const [doctors, setDoctors] = useState([]);
  const { name } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      const options = {
        method: "GET",
        url: `/doctors/${name}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setDoctors(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {doctors.first_name} {doctors.last_name}
        </CardTitle>
        <CardDescription>{doctors.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <img src={doctors.image_path} alt={doctors.title} />
      </CardContent>
      <CardFooter className="flex-col gap-2"></CardFooter>
    </Card>
  );
}
