import { Spinner } from "./ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Loader({ name }) {
  return (
    <div className="flex items-center gap-6 ">
      <SpinnerEmpty className="size-8" name={name} />
    </div>
  );
}

function SpinnerEmpty({ name }) {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Loading {name}...</EmptyTitle>
        <EmptyDescription>
          Please wait. Do not refresh the page.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
