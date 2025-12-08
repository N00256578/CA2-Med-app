import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const { token } = useAuth();

  if (!token) {
    return (
      <Navigate
        to={"/"}
        state={{ message: "Unauthorized user! Please login", type: "error" }}
      />
    );
  }
  return <Outlet />;
}
