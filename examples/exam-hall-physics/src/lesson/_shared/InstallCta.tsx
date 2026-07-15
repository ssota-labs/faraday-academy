import { Callout, Prose } from "@faraday-academy/kit/blocks";

const CTA = `/plugin marketplace add ssota-labs/faraday-academy
/plugin install faraday@faraday

Then say: "Turn this topic into an interactive Faraday lesson: <topic>.
Scaffold, author, run pnpm check and pnpm dev, then give me the URL."

Repo: https://github.com/ssota-labs/faraday-academy`;

export function InstallCta({ topic = "high-school physics" }: { topic?: string }) {
  return (
    <Callout title="Make your own Faraday lesson">
      <Prose>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed">
          {CTA.replace("<topic>", topic)}
        </pre>
      </Prose>
    </Callout>
  );
}
