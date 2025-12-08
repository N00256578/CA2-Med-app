import { useEffect, useState } from "react";
import axios from "@/config/api";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import DeleteBtn from "@/components/DeleteBtn";
import { useAuth } from "@/hooks/useAuth";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

export default function Index() {
  const [festivals, setFestivals] = useState([]);
  const { token } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFestivals = async () => {
      const options = {
        method: "GET",
        url: "/festivals",
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setFestivals(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFestivals();
  }, []);

  const onDeleteCallback = (id) => {
    toast.success("Festival deleted successfully");
    setFestivals(festivals.filter((festival) => festival.id !== id));
  };

  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">
          <Link size="sm" to={`/festivals/create`}>
            Create New Festival
          </Link>
        </Button>
      )}

      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            {token && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {festivals.map((festival) => (
            <TableRow key={festival.id}>
              <TableCell>{festival.title}</TableCell>
              <TableCell>{festival.city}</TableCell>
              <TableCell>{festival.start_date}</TableCell>
              <TableCell>{festival.end_date}</TableCell>
              {token && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      className="cursor-pointer hover:border-blue-500"
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/festivals/${festival.id}`)}
                    >
                      <Eye />
                    </Button>
                    <Button
                      className="cursor-pointer hover:border-blue-500"
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/festivals/${festival.id}/edit`)}
                    >
                      <Pencil />
                    </Button>
                    <DeleteBtn
                      onDeleteCallback={onDeleteCallback}
                      resource="festivals"
                      id={festival.id}
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
