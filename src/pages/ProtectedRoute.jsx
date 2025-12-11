import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const { token } = useAuth();

  // Check if token exists and is still valid
  if (!token) {
    return (
      <Navigate
        to={"/"}
        state={{
          message: "Please login again",
          type: "error",
        }}
      />
    );
  }
  return <Outlet />;
}
