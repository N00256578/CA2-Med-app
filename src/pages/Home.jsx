import LoginForm from "@/components/LoginForm";
import Scheduler from "@/components/Scheduler";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { token } = useAuth();
  return (
    <>
      {!token ? (
        <LoginForm />
      ) : (
        <div className="w-full">
          <h1 className="text-2xl font-bold">
            Welcome to the Medical App Dashboard
          </h1>
          <p className="mt-4 text-xl font-bold">Todays appointments:</p>
          <Scheduler />
        </div>
      )}
    </>
  );
}
