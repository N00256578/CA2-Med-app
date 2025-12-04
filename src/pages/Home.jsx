import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
    const { token } = useAuth();
    return (
        <>
            <h1>This is Home</h1>
            
            {!token && <LoginForm />}
            
        </>
    );
};