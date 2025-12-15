import { Field, Form, Formik } from "formik";
import TextInputLiveFeedback from "../TextInputLiveFeedback";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { useState } from "react";
import { save } from "@/api";
import { useData } from "@/contexts/DataContext";

export default function DoctorForm({ doctor }) {
  const navigate = useNavigate();
  const [phoneError, setPhoneError] = useState(false);
  const [mailError, setMailError] = useState(false);
  const { loading } = useData();

  const DoctorSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .length(10, "Phone number must be 10 digits")
      .required("Phone number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    specialisation: Yup.string().required("Specialisation is required"),
  });

  const submitForm = async (values) => {
    try {
      save("doctors", { values, id: doctor?.id });
    } catch (err) {
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
    setMailError(false);
    setPhoneError(false);
    submitForm(values);
  };

  return loading ? (
    <Loader name="doctor" />
  ) : (
    <Formik
      initialValues={{
        first_name: doctor?.first_name || "",
        last_name: doctor?.last_name || "",
        phone: doctor?.phone || "",
        email: doctor?.email || "",
        specialisation: doctor?.specialisation || "",
      }}
      onSubmit={handleSubmit}
      className="w-full "
      validationSchema={DoctorSchema}
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
                <Field as="select" id="specialisation" name="specialisation">
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
                {doctor ? "Update" : "Create"} Doctor
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
  );
}
