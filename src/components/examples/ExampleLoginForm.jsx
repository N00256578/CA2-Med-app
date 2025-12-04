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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";

export default function LoginForm() {
  const { onLogin } = useAuth();

  const formSchema = z.object({
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const submitForm = async (data) => {
    console.log(data);
    let response = await onLogin(data.email, data.password);
    console.log(response);
    response && toast.error(response.msg);
  };

  return (
    <Card className="w-full max-w-md">
      <Toaster />
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form-example" onSubmit={form.handleSubmit(submitForm)}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-example-email">Email</FieldLabel>
                    <Input
                      id="form-example-email"
                      {...field}
                      placeholder="m@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-example-password">
                      Password
                    </FieldLabel>
                    <Input
                      id="form-example-password"
                      {...field}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          variant="outline"
          form="login-form-example"
          type="submit"
          className="w-full cursor-pointer"
        >
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}
