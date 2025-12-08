import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useParams } from 'react-router';
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
  const [festival, setFestival] = useState([]);
  const { id } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const fetchFestival = async () => {
      const options = {
        method: "GET",
        url: `/festivals/${id}`,
        headers: {
            Authorization: `Bearer ${token}`
        }
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setFestival(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFestival();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{festival.title}</CardTitle>
        <CardDescription>
          {festival.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <img src={festival.image_path} alt={festival.title} />
      </CardContent>
      <CardFooter className="flex-col gap-2">
      </CardFooter>
    </Card>
  );
}
