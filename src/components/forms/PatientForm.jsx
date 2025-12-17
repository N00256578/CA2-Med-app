import { Form, Formik } from "formik";
import TextInputLiveFeedback from "../TextInputLiveFeedback";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { save } from "@/api";
import useSWRMutation from "swr/mutation";
import FormikDatePicker from "../DatePicker";
import { useState } from "react";

export default function PatientForm({ patient }) {
  const navigate = useNavigate();

  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [otherError, setOtherError] = useState(false);

  const { trigger: savePatient, isMutating } = useSWRMutation("patients", save);

  const PatientSchema = Yup.object().shape({
    first_name: Yup.string()
      .min(2, "First name must be at least 2 characters")
      .max(255, "First name can be max 255 characters")
      .required("First name is required"),
    last_name: Yup.string()
      .min(2, "Last name must be at least 2 characters")
      .max(255, "Last name can be max 255 characters")
      .required("Last name is required"),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .length(10, "Phone number must be 10 digits")
      .required("Phone number is required"),
    email: Yup.string()
      .email("Invalid email")
      .matches(/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,4}$/, "Invalid email format")
      .required("Email is required"),
    address: Yup.string().required("Address is required"),
    date_of_birth: Yup.date()
      .required("Date of Birth is required")
      .max(new Date(), "Date of birth cannot be in the future"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log("presses send", values);
    setSubmitting(true);
    const formattedValues = {
      ...values,
      date_of_birth: new Date(values.date_of_birth).toISOString().split("T")[0],
    };
    try {
      await savePatient({ id: patient?.id ?? null, ...formattedValues });
      navigate("/patients", {
        state: {
          type: "success",
          message: `Patient ${patient ? "updated" : "created"} successfully`,
        },
      });
    } catch (err) {
      console.error("Submit error:", err);

      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message.toLowerCase();

        if (errorMessage.includes("phone")) {
          setPhoneError(true);
        } else if (errorMessage.includes("email")) {
          setEmailError(true);
        } else {
          setOtherError(true);
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
        first_name: patient?.first_name || "",
        last_name: patient?.last_name || "",
        phone: patient?.phone || "",
        email: patient?.email || "",
        address: patient?.address || "",
        date_of_birth: patient?.date_of_birth
          ? patient.date_of_birth
          : "2000-01-01",
      }}
      onSubmit={handleSubmit}
      className="w-full"
      validationSchema={PatientSchema}
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
                {emailError && (
                  <div className="text-red-500 text-sm">
                    This email address already exists.
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <TextInputLiveFeedback
                  label="Address"
                  id="address"
                  name="address"
                  placeholder="Address"
                />
              </div>

              <div className="grid gap-2">
                <FormikDatePicker name="date_of_birth" />
                {errors.date_of_birth && touched.date_of_birth && (
                  <div className="text-red-500 text-sm">
                    {errors.date_of_birth}
                  </div>
                )}
              </div>
              {otherError && (
                <div className="text-red-500 text-sm">
                  An unknown error occurred.
                </div>
              )}
              <Button
                type="submit"
                variant="outline"
                className="mt-4 cursor-pointer"
              >
                {patient ? "Update" : "Create"} Patient
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate("/patients")}
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
