import ExampleLoginForm from "@/components/examples/ExampleLoginForm";
import MoreFormExamples from "@/components/examples/MoreFormExamples";

export default function Forms() {
  return (
    <div className="flex flex-col gap-1 mx-auto max-w-xl mt-4 mb-16">
      <h1 className="text-2xl font-bold">Forms</h1>
      <p className="mb-4 text-sm text-muted-foreground ">
        This page demonstrates various form examples. See the code for more
        details. The Field component is used to create form fields with labels
        and inputs. See{" "}
        <a
          href="https://ui.shadcn.com/docs/components/field"
          className="underline"
        >
          here
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mb-2 mt-6">Login Form Example</h2>
      <ExampleLoginForm />
      <p className="mt-4 text-sm text-muted-foreground ">
        The above example demonstrates the use of{" "}
        <a className="underline" href="https://react-hook-form.com/">
          React Hook Form
        </a>{" "}
        which simplifies form handling in React and provides a structured
        approach to handling form data.
      </p>
      <p className="mt-4 text-sm text-muted-foreground ">
        While the React Hook Form library can handle form validation on its own,
        in this example,{" "}
        <a className="underline" href="https://zod.dev/">
          Zod
        </a>{" "}
        is used for form validation because it offers a more robust and flexible
        schema-based validation system. Zod allows for defining complex
        validation rules and data structures, making it easier to manage and
        maintain validation logic, especially in larger applications.{" "}
      </p>
      <p className="mt-4 text-sm text-muted-foreground mr-auto max-w-lg">
        Combining React Hook Form with Zod provides a powerful solution for
        building forms with comprehensive validation requirements.
      </p>

      <h2 className="text-xl font-semibold mb-2 mt-16">
        Calendar, Enums, and dropdown data from an API
      </h2>
      <p className="mt-4 text-sm text-muted-foreground ">
        Dont forget to install the ShadCN Components used, for example, the
        calendar select uses, Calendar and Popover{" "}
        <code>npx shadcn@latest add calendar popover</code>
      </p>
      <MoreFormExamples />
    </div>
  );
}
