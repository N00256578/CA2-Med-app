import { Spinner } from "./ui/spinner";

export default function Loader({ name }) {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-8 " />
      Loading {name}...
    </div>
  );
}
