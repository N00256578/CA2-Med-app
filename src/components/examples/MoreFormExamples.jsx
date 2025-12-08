import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/config/api";

export default function MoreFormExamples() {
  const [dobWindowOpen, setDobWindowOpen] = useState(false);
  const [performers, setPerformers] = useState([]);

  useEffect(() => {
    const fetchPerformers = async () => {
      const options = {
        method: "GET",
        url: "/performers",
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setPerformers(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPerformers();
  }, []);

  const formSchema = z.object({
    department: z.enum([
      "engineering",
      "design",
      "marketing",
      "sales",
      "support",
    ]),
    performer: z.string(),
    dob: z.date("Date of Birth is required"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: "",
      performar: "",
      dob: "",
    },
    mode: "onChange",
  });

  const submitForm = (data) => {
    let formattedData = {
      department: data.department,
      dob: data.dob.toISOString().split("T")[0],
      performer_id: Number(data.performer),
    };
    console.log(formattedData);
  };

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader>
        <CardTitle>Various Form Examples</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-demo-2" onSubmit={form.handleSubmit(submitForm)}>
          <div className="flex flex-col gap-6">
            <Controller
              name="department"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Department (Enums)</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Choose department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="support">Customer Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select your department or area of work.
                  </FieldDescription>
                </Field>
              )}
            />

            <Controller
              name="performer"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Select Performer (API data)</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Choose performer" />
                    </SelectTrigger>
                    <SelectContent>
                      {performers.map((performer) => (
                        <SelectItem
                          key={performer.id}
                          value={performer.id.toString()}
                        >
                          {performer.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>Select your performer.</FieldDescription>
                </Field>
              )}
            />

            <Controller
              name="dob"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-example-dob">
                    Date of Birth
                  </FieldLabel>
                  <Popover open={dobWindowOpen} onOpenChange={setDobWindowOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                      >
                        {field.value
                          ? field.value.toLocaleDateString()
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        captionLayout="dropdown"
                        onSelect={(selectedDate) => {
                          field.onChange(selectedDate);
                          setDobWindowOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>Select your dob.</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            form="form-demo-2"
          >
            Reset
          </Button>
          <Button
            type="submit"
            onClick={() => {
              form.handleSubmit(submitForm);
            }}
            variant="outline"
            form="form-demo-2"
          >
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
