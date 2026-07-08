// <Segmented> — a single-select segmented control (built on Tabs).
import { Label } from "@/faraday/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/faraday/ui/tabs";

export function Segmented(props: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {props.label ? <Label>{props.label}</Label> : null}
      <Tabs value={props.value} onValueChange={(v) => props.onChange(String(v))}>
        <TabsList>
          {props.options.map((o) => (
            <TabsTrigger key={o.value} value={o.value}>
              {o.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
