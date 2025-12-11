import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useData } from "@/contexts/DataContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Yup from "yup";
import TextInputLiveFeedback from "@/components/TextInputLiveFeedback";

export default function Create() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { refreshDoctors } = useData();

  const [phoneError, setPhoneError] = useState(false);
  const [mailError, setMailError] = useState(false);

  const CreateDoctorSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .length(10, "Phone number must be 10 digits")
      .required("Phone number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    specialisation: Yup.string().required("Specialisation is required"),
  });

  const createDoctor = async (values) => {
    const options = {
      method: "POST",
      url: `/doctors`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: values,
    };

    try {
      let response = await axios.request(options);
      console.log(response.data);
      refreshDoctors();
      navigate("/doctors", {
        state: {
          type: "success",
          message: `Doctor "${response.data.first_name} ${response.data.last_name}" created successfully`,
        },
      });
    } catch (err) {
      console.log("This is the error:", err.response.data.message);
      if (err.response.data.message.includes("phone")) {
        console.log("Setting phone error to true");
        setPhoneError(true);
      }
      if (err.response.data.message.includes("email")) {
        console.log("Setting mail error to true");
        setMailError(true);
      }
      console.log("Phone error:", phoneError);
    }
  };

  const handleSubmit = (values) => {
    console.log("Values: ", values);
    setMailError(false);
    setPhoneError(false);
    createDoctor(values);
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <CardHeader>
        <CardTitle>Create a new Doctor</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            first_name: "",
            last_name: "",
            phone: "",
            email: "",
            specialisation: "",
          }}
          onSubmit={handleSubmit}
          className="w-full "
          validationSchema={CreateDoctorSchema}
        >
          {({ errors, touched }) => (
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

                  <div className="grid gap-2 w-full">
                    <TextInputLiveFeedback
                      label="Phone Number"
                      helpText="Must be 10 digits"
                      id="phone"
                      name="phone"
                      placeholder="Phone Number"
                    />
                    {phoneError && (
                      <div className="text-red-500 text-sm">
                        This phone number already exists.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <TextInputLiveFeedback
                      label="Email"
                      id="email"
                      name="email"
                      placeholder="Email"
                    />
                    {mailError && (
                      <div className="text-red-500 text-sm">
                        This email address already exists.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="specialisation" className="mr-4">
                      Specialisation
                    </label>
                    <Field
                      as="select"
                      id="specialisation"
                      name="specialisation"
                    >
                      <option value="" disabled>
                        Select Specialisation
                      </option>
                      <option value="Podiatrist">Podiatrist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Psychiatrist">Psychiatrist</option>
                      <option value="General Practitioner">
                        General Practitioner
                      </option>
                    </Field>
                    {errors.specialisation && touched.specialisation && (
                      <div className="text-red-500 text-sm">
                        {errors.specialisation}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="mt-4 cursor-pointer"
                  >
                    Create Doctor
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => navigate("/doctors")}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
