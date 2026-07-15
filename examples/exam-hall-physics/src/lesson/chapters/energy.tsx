// Chapter 6 — 역학적 에너지
// Outcome: KE+PE 보존으로 계단·스프링 상황을 계산한다.
import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  Chart,
  ParamSlider,
  Callout,
  Derivation,
  NumericAnswer,
  Quiz,
  TeX,
  Readout,
  Compare,
} from "@faraday-academy/kit/blocks";

const G = 9.8;

export default function EnergyChapter() {
  const [mass, setMass] = useState(5);
  const [height, setHeight] = useState(4);
  const [frac, setFrac] = useState(0.4); // fraction of height descended

  const PE0 = mass * G * height;
  const y = height * (1 - frac);
  const PE = mass * G * y;
  const KE = PE0 - PE; // frictionless
  const v = Math.sqrt((2 * KE) / mass);

  const chartData = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => {
      const f = i / 20;
      const yy = height * (1 - f);
      const pe = mass * G * yy;
      const ke = PE0 - pe;
      return { f: f * 100, PE: pe, KE: ke, E: PE0 };
    });
  }, [mass, height, PE0]);

  // Check: m=2, h=5 → PE = 2*9.8*5 = 98 J; at bottom KE=98, v=√(2*98/2)=√98≈9.90
  const checkV = Math.sqrt(2 * G * 5);

  return (
    <Lesson
      topic="시험장의 물리 · 6"
      title="역학적 에너지"
      lead="고사실 건물 계단을 내려갈 때, 위치에너지가 어디로 갈까?"
    >
      <Prose heading="Engage — 계단과 배낭">
        <p>
          높이 <TeX>{String.raw`h`}</TeX>에서 내려오면 위치에너지가 줄고
          운동에너지가 는다. 마찰이 없다면 합 — 역학적 에너지 — 은 일정하다.
        </p>
      </Prose>

      <Prose heading="Explore — 에너지 막대">
        <p>
          내려간 비율을 슬라이더로 바꿔 보라. 파란(위치)과 주황(운동)의 합이
          항상 같은지 확인한다.
        </p>
      </Prose>

      <Workbench
        title="계단 모델 (마찰 없음)"
        onReset={() => {
          setMass(5);
          setHeight(4);
          setFrac(0.4);
        }}
        hud={
          <>
            <Readout label="PE" value={`${PE.toFixed(0)} J`} />
            <Readout label="KE" value={`${KE.toFixed(0)} J`} tone="primary" />
            <Readout label="E" value={`${PE0.toFixed(0)} J`} />
            <Readout label="v" value={`${v.toFixed(2)} m/s`} />
          </>
        }
        controls={
          <ControlGroup label="상태">
            <ParamSlider
              label="질량 m"
              value={mass}
              min={1}
              max={15}
              step={0.5}
              onChange={setMass}
              format={(n) => `${n.toFixed(1)} kg`}
            />
            <ParamSlider
              label="초기 높이 h"
              value={height}
              min={1}
              max={10}
              step={0.5}
              onChange={setHeight}
              format={(n) => `${n.toFixed(1)} m`}
            />
            <ParamSlider
              label="내려간 비율"
              value={frac}
              min={0}
              max={1}
              step={0.05}
              onChange={setFrac}
              format={(n) => `${(n * 100).toFixed(0)}%`}
            />
          </ControlGroup>
        }
      >
        <svg viewBox="0 0 640 220" role="img" aria-label="에너지 막대와 높이">
          {/* stairs silhouette */}
          <path
            d="M80 180 L80 40 L200 40 L200 80 L320 80 L320 120 L440 120 L440 160 L560 160 L560 180 Z"
            fill="none"
            stroke="var(--border)"
            strokeWidth={2}
          />
          <circle
            cx={100 + frac * 420}
            cy={50 + frac * 120}
            r={14}
            style={{ fill: "var(--primary)" }}
          />
          {/* stacked bars */}
          <rect
            x={500}
            y={180 - (PE / PE0) * 140}
            width={28}
            height={(PE / PE0) * 140}
            style={{ fill: "var(--chart-1)" }}
          />
          <rect
            x={540}
            y={180 - (KE / PE0) * 140}
            width={28}
            height={(KE / Math.max(PE0, 1)) * 140}
            style={{ fill: "var(--chart-2)" }}
          />
          <text x={514} y={200} fontSize={10} style={{ fill: "var(--muted-foreground)" }}>
            PE
          </text>
          <text x={554} y={200} fontSize={10} style={{ fill: "var(--muted-foreground)" }}>
            KE
          </text>
        </svg>
      </Workbench>

      <Prose heading="Explain — 보존">
        <p>
          중력만 일하면 (또는 보존력만) 역학적 에너지가 보존된다.
        </p>
      </Prose>

      <Derivation
        title="높이 → 속력"
        steps={[
          { tex: String.raw`E = K + U = \tfrac12 mv^2 + mgy`, note: "역학적 에너지" },
          {
            tex: String.raw`m g h = \tfrac12 m v^2 \quad (y=0)`,
            note: "꼭대기 → 바닥, 마찰 없음",
          },
          {
            tex: String.raw`v = \sqrt{2gh}`,
            note: "질량이 소거된다",
          },
        ]}
      />

      <Prose heading="Elaborate — 교환 곡선">
        <p>
          내려간 비율에 따라 PE↓ KE↑, 합은 수평선. 마찰이 있으면 합이 줄어들고
          열로 새어 나간다.
        </p>
      </Prose>

      <Chart
        type="line"
        data={chartData}
        x="f"
        xType="number"
        yAxis
        series={[
          { key: "PE", label: "PE (J)" },
          { key: "KE", label: "KE (J)" },
          { key: "E", label: "E (J)" },
        ]}
      />

      <Compare
        defaultValue="cons"
        items={[
          {
            value: "cons",
            label: "보존",
            content: (
              <Prose>
                <p>이상적인 미끄럼틀: <TeX>{String.raw`K+U=\text{const}`}</TeX>.</p>
              </Prose>
            ),
          },
          {
            value: "fric",
            label: "마찰",
            content: (
              <Prose>
                <p>
                  마찰이 일을 하면 <TeX>{String.raw`\Delta E_{\text{mech}} = W_{\text{nc}}`}</TeX>.
                  역학적 에너지는 줄고 열에너지가 는다.
                </p>
              </Prose>
            ),
          },
        ]}
      />

      <Callout title="시험장 팁">
        「무거운 물체가 더 빨리 떨어진다」와 에너지식을 혼동하지 말 것.{" "}
        <TeX>{String.raw`v=\sqrt{2gh}`}</TeX>에는 질량이 없다(공기저항 무시).
      </Callout>

      <NumericAnswer
        question="높이 5 m에서 정지 출발, 마찰 없음. 바닥 속력 v (m/s)? (g=9.8)"
        answer={checkV}
        unit="m/s"
        tolerance={0.15}
        hint="v = √(2gh) = √(2·9.8·5) = √98 ≈ 9.90."
      />

      <Quiz
        question="마찰 없는 언덕 꼭대기에서 굴러 내려올 때, 바닥에 도달하는 속력은 질량에?"
        options={[
          { label: "비례한다", hint: "mgh = ½mv² 에서 m이 소거." },
          { label: "반비례한다", hint: "에너지 보존식에 m이 양변에." },
          {
            label: "무관하다(이상화)",
            correct: true,
            hint: "v=√(2gh).",
          },
          { label: "질량 제곱에 비례", hint: "운동에너지와 혼동." },
        ]}
      />
    </Lesson>
  );
}
