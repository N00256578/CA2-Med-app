import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextInputLiveFeedback from "../TextInputLiveFeedback";

export default function LoginForm() {
  const { login } = useAuth();

  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email")
      .matches(/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,4}$/, "Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    const success = await login(values.email, values.password);

    if (!success) {
      setErrors({ email: "Invalid credentials" });
    }

    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <TextInputLiveFeedback
                label="Email"
                name="email"
                placeholder="Email"
              />

              <TextInputLiveFeedback
                label="Password"
                name="password"
                type="password"
                placeholder="Password"
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Login
              </Button>
            </CardFooter>
          </Card>
        </Form>
      )}
    </Formik>
  );
}
