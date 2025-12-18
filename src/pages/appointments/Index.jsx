import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSortColumn } from "@/hooks/useSortColumn";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function Index() {
  const { token } = useAuth();
  const { sortColumn, changeSortOrder } = useSortColumn();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="outline">
          <Link to={`/appointments/create`}>Create New Appointment</Link>
        </Button>
        <input
          type="text"
          value={search}
          className="flex-1 block border border-gray-300 rounded-md px-3 py-2"
          placeholder="Search patients..."
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      </div>
      {/* Render appointments table or list here */}
    </>
  );
}
