import { post } from "@/api";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router";
import useSWRMutation from "swr/mutation";
import * as Yup from "yup";
import TextInputLiveFeedback from "../TextInputLiveFeedback";
import { Button } from "../ui/button";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { trigger: register, isMutating } = useSWRMutation("register", post);
  const [userError, setUserError] = useState(false);

  const registerSchema = Yup.object().shape({
    first_name: Yup.string()
      .min(2, "First name must contain at least 2 characters")
      .max(255, "First name cannot contain more than 255 characters")
      .required("First name is required"),
    last_name: Yup.string()
      .min(2, "Last name must contain at least 2 characters")
      .max(255, "Last  name cannot contain more than 255 characters")
      .required("Last name is required"),
    email: Yup.string()
      .email("Invalid email")
      .matches(/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,4}$/, "Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .max(255, "Length cannot be more than 255 characters")
      .required("Password is required"),
    password_2: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);

    try {
      await register({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
      });
      navigate("/", {
        state: {
          type: "success",
          message: `User created successfully`,
        },
      });
    } catch (err) {
      console.error("Submit error:", err);

      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message.toLowerCase();

        if (errorMessage.includes("user already exists")) {
          setUserError(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_2: "",
      }}
      onSubmit={handleSubmit}
      className="w-full"
      validationSchema={registerSchema}
    >
      {() => (
        <>
          <Form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <TextInputLiveFeedback
                  label="First Name"
                  id="first_name"
                  name="first_name"
                  placeholder="First Name"
                />
              </div>

              <div className="grid gap-2 w-full">
                <TextInputLiveFeedback
                  label="Last Name"
                  id="last_name"
                  name="last_name"
                  placeholder="Last Name"
                />
              </div>

              <div className="grid gap-2">
                <TextInputLiveFeedback
                  label="Email"
                  id="email"
                  name="email"
                  placeholder="Email"
                />
              </div>

              <div className="grid gap-2">
                <TextInputLiveFeedback
                  label="Password"
                  id="password"
                  name="password"
                  placeholder="password"
                  type="password"
                />
              </div>

              <div className="grid gap-2">
                <TextInputLiveFeedback
                  label="Repeat Password"
                  id="password_2"
                  name="password_2"
                  placeholder="password"
                  type="password"
                />
              </div>

              {userError && (
                <div className="text-red-500 text-sm">
                  This user already exists.
                </div>
              )}

              <Button
                type="submit"
                variant="outline"
                className="mt-4 cursor-pointer"
              >
                Register User
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate("/")}
                disabled={isMutating}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </>
      )}
    </Formik>
  );
}
