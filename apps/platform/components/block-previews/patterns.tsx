"use client";

import { useState, type ReactNode } from "react";
import {
  Compare,
  ControlGroup,
  Derivation,
  NumericAnswer,
  ParamSlider,
  Prose,
  Quiz,
  Readout,
  Segmented,
  Workbench,
} from "@faraday-academy/kit/blocks";
type PatternPreviewProps = { compact?: boolean };

function ParamLabDemo({ compact }: PatternPreviewProps) {
  const [mass, setMass] = useState(3);
  const [vel, setVel] = useState(4);
  return (
    <Workbench
      title="Momentum"
      panelTitle="Parameters"
      onReset={() => {
        setMass(3);
        setVel(4);
      }}
      controls={
        <ControlGroup label="Inputs">
          <ParamSlider label="Mass (kg)" value={mass} min={1} max={10} onChange={setMass} />
          <ParamSlider label="Velocity (m/s)" value={vel} min={0} max={10} onChange={setVel} />
        </ControlGroup>
      }
    >
      <div className={`flex flex-col items-center justify-center gap-3 ${compact ? "h-28" : "h-40"}`}>
        <div
          className="rounded-full bg-primary transition-all"
          style={{ width: 24 + mass * 8, height: 24 + mass * 8 }}
        />
        <Readout label="p = m·v" value={`${(mass * vel).toFixed(1)} kg·m/s`} tone="primary" />
      </div>
    </Workbench>
  );
}

function McqCheckDemo() {
  return (
    <div className="space-y-4">
      <Prose heading="Momentum is conserved when…">
        Think about which forces are internal to the system you chose.
      </Prose>
      <Quiz
        question="When is momentum conserved?"
        options={[
          { label: "No external force", correct: true, hint: "Closed system." },
          { label: "Always", hint: "Only in a closed system." },
        ]}
      />
    </div>
  );
}

function NumericGateDemo() {
  return (
    <div className="space-y-4">
      <Derivation
        title="Impulse"
        defaultOpen
        steps={[
          { tex: "J = F \\Delta t", note: "Definition" },
          { tex: "J = \\Delta p", note: "Equals change in momentum" },
        ]}
      />
      <NumericAnswer
        question="A 2 kg cart moves at 3 m/s. What is its momentum?"
        answer={6}
        tolerance={0.1}
        unit="kg·m/s"
        hint="p = m × v"
      />
    </div>
  );
}

function CompareModesDemo() {
  const [mode, setMode] = useState("elastic");
  return (
    <div className="space-y-4">
      <Segmented
        label="Collision type"
        value={mode}
        onChange={setMode}
        options={[
          { value: "elastic", label: "Elastic" },
          { value: "inelastic", label: "Inelastic" },
        ]}
      />
      <Compare
        key={mode}
        defaultValue={mode}
        items={[
          {
            value: "elastic",
            label: "Elastic",
            content: (
              <Prose>
                Kinetic energy is conserved. Relative speed of separation matches approach.
              </Prose>
            ),
          },
          {
            value: "inelastic",
            label: "Inelastic",
            content: (
              <Prose>
                Momentum is conserved; kinetic energy is not. Some energy leaves as heat or
                deformation.
              </Prose>
            ),
          },
        ]}
      />
    </div>
  );
}

export const PATTERN_PREVIEW_DEMOS: Record<string, (props: PatternPreviewProps) => ReactNode> = {
  ParamLab: (props) => <ParamLabDemo {...props} />,
  McqCheck: () => <McqCheckDemo />,
  NumericGate: () => <NumericGateDemo />,
  CompareModes: () => <CompareModesDemo />,
};
