import { Button } from "@/components/ui/button";

export const TabSelector = ({
  options,
  selected,
  onSelect,
  onSelectCallback,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      {options.map((option) => (
        <Button
          key={option}
          variant={selected === option ? "secondary" : "outline"}
          onClick={() => {
            if (onSelectCallback) onSelectCallback();
            onSelect(option);
          }}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};
