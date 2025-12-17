import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FormikDatePicker({ name }) {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  return (
    <div>
      <DatePicker
        selected={field.value ? new Date(field.value) : null}
        onChange={(date) =>
          setFieldValue(name, date ? date.toISOString().split("T")[0] : "")
        }
        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        dateFormat="dd MMM yyyy"
      />
      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm">{meta.error}</div>
      )}
    </div>
  );
}
