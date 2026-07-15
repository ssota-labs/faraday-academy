// Chapter 1 — 측정과 단위
// Outcome: SI 단위·차원·유효숫자를 시험장 상황에서 올바르게 쓰고 환산한다.
import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  Chart,
  ParamSlider,
  Segmented,
  Callout,
  Derivation,
  Reveal,
  Quiz,
  NumericAnswer,
  TeX,
  Readout,
  Compare,
} from "@faraday-academy/kit/blocks";

const PREFIX: Record<string, number> = {
  mm: 1e-3,
  cm: 1e-2,
  m: 1,
  km: 1e3,
};

export default function MeasurementChapter() {
  const [value, setValue] = useState(120);
  const [fromUnit, setFromUnit] = useState("cm");
  const [toUnit, setToUnit] = useState("m");
  const [sigDigits, setSigDigits] = useState(3);

  const metres = value * PREFIX[fromUnit];
  const converted = metres / PREFIX[toUnit];
  const display = Number(converted.toPrecision(sigDigits));

  const chartData = useMemo(
    () =>
      [0.5, 1, 2, 5, 10, 20, 50, 100].map((v) => ({
        input: v,
        metres: v * PREFIX[fromUnit],
      })),
    [fromUnit],
  );

  return (
    <Lesson
      topic="시험장의 물리 · 1"
      title="측정과 단위"
      lead="시험장 복도 길이, 책상 높이, 초시계 눈금 — 숫자만 쓰지 말고 단위와 차원을 붙인다."
    >
      <Prose heading="Engage — 복도 표지판">
        <p>
          고사장이 있는 건물 입구에 「고사실까지 <strong>120</strong>」이라고만 적혀 있다.
          단위가 빠지면 120 cm인지 120 m인지 알 수 없다. 물리에서는{" "}
          <TeX>{String.raw`120\,\text{cm}`}</TeX>처럼 <strong>수치 + 단위</strong>가 한 쌍이다.
        </p>
        <p>
          수능 물리의 첫 관문은 화려한 공식이 아니라, SI 기본 단위와 차원이 맞는지
          보는 습관이다.
        </p>
      </Prose>

      <Prose heading="Explore — 단위 환산 실험">
        <p>
          아래에서 측정값과 단위를 바꿔 보라. 같은 길이가 다른 단위로 어떻게
          보이는지, 그리고 유효숫자를 줄이면 무엇이 사라지는지 관찰한다.
        </p>
      </Prose>

      <Workbench
        title="복도 거리 환산기"
        onReset={() => {
          setValue(120);
          setFromUnit("cm");
          setToUnit("m");
          setSigDigits(3);
        }}
        hud={
          <>
            <Readout label="입력" value={`${value} ${fromUnit}`} />
            <Readout label="결과" value={`${display} ${toUnit}`} tone="primary" />
            <Readout label="SI" value={`${metres.toExponential(3)} m`} />
          </>
        }
        controls={
          <>
            <ControlGroup label="측정값">
              <ParamSlider
                label="수치"
                value={value}
                min={1}
                max={500}
                step={1}
                onChange={setValue}
              />
              <Segmented
                label="원래 단위"
                value={fromUnit}
                onChange={setFromUnit}
                options={[
                  { value: "mm", label: "mm" },
                  { value: "cm", label: "cm" },
                  { value: "m", label: "m" },
                  { value: "km", label: "km" },
                ]}
              />
              <Segmented
                label="바꿀 단위"
                value={toUnit}
                onChange={setToUnit}
                options={[
                  { value: "mm", label: "mm" },
                  { value: "cm", label: "cm" },
                  { value: "m", label: "m" },
                  { value: "km", label: "km" },
                ]}
              />
            </ControlGroup>
            <ControlGroup label="유효숫자" defaultOpen={false}>
              <ParamSlider
                label="자릿수"
                value={sigDigits}
                min={1}
                max={5}
                step={1}
                onChange={setSigDigits}
                format={(n) => `${n}자리`}
              />
            </ControlGroup>
          </>
        }
      >
        <svg viewBox="0 0 640 160" role="img" aria-label="복도 길이 스케일">
          <rect x={40} y={70} width={560} height={12} rx={2} style={{ fill: "var(--muted)" }} />
          <rect
            x={40}
            y={70}
            width={Math.min(560, (metres / 5) * 560)}
            height={12}
            rx={2}
            style={{ fill: "var(--primary)" }}
          />
          <text x={40} y={50} fontSize={12} style={{ fill: "var(--muted-foreground)" }}>
            0
          </text>
          <text x={580} y={50} fontSize={12} textAnchor="end" style={{ fill: "var(--muted-foreground)" }}>
            5 m 스케일
          </text>
          <text x={320} y={120} fontSize={14} textAnchor="middle" style={{ fill: "var(--foreground)" }}>
            {display} {toUnit}
          </text>
        </svg>
      </Workbench>

      <Prose heading="Explain — SI와 차원">
        <p>
          길이의 SI 기본 단위는 미터 <TeX>{String.raw`\mathrm{m}`}</TeX>이다. 접두어는
          거듭제곱으로 묶는다:
        </p>
        <TeX block>{String.raw`1\,\mathrm{cm} = 10^{-2}\,\mathrm{m},\quad 1\,\mathrm{km} = 10^{3}\,\mathrm{m}`}</TeX>
        <p>
          차원 검사: 속도는 <TeX>{String.raw`[\mathrm{L}]/[\mathrm{T}]`}</TeX>, 가속도는{" "}
          <TeX>{String.raw`[\mathrm{L}]/[\mathrm{T}]^2`}</TeX>. 좌변·우변 차원이 다르면
          식이 틀린 것이다.
        </p>
      </Prose>

      <Derivation
        title="환산 한 줄"
        steps={[
          { tex: String.raw`x = N \times u`, note: "측정값 = 수치 × 단위" },
          {
            tex: String.raw`x = 120\,\mathrm{cm} = 120 \times 10^{-2}\,\mathrm{m}`,
            note: "cm → m 접두어",
          },
          {
            tex: String.raw`x = 1.20\,\mathrm{m}`,
            note: "유효숫자 세 자리 유지",
          },
        ]}
      />

      <Prose heading="Elaborate — 입력 단위별 미터 환산">
        <p>
          같은 수치라도 원래 단위가 다르면 SI 미터 값은 완전히 달라진다. 그래프에서
          기울기가 곧 접두어 인자다.
        </p>
      </Prose>

      <Chart
        type="line"
        data={chartData}
        x="input"
        xType="number"
        yAxis
        series={[{ key: "metres", label: `${fromUnit} → m` }]}
      />

      <Compare
        defaultValue="ok"
        items={[
          {
            value: "ok",
            label: "올바른 표기",
            content: (
              <Prose>
                <p>
                  <TeX>{String.raw`v = 3.0\,\mathrm{m/s}`}</TeX> — 수치·단위·유효숫자가
                  모두 있다.
                </p>
              </Prose>
            ),
          },
          {
            value: "bad",
            label: "흔한 실수",
            content: (
              <Prose>
                <p>
                  「속도 = 3」만 쓰면 차원이 빠진다. 「3 m」는 길이이지 속도가 아니다.
                </p>
              </Prose>
            ),
          },
        ]}
      />

      <Callout title="시험장 팁">
        계산기 답만 옮기지 말고, 마지막에 단위를 다시 확인한다. 단위 실수는
        「개념은 맞는데 틀리는」 전형적 원인이다.
      </Callout>

      <Prose heading="Evaluate">
        <p>아래 두 문항은 위에서 조작한 환산과 차원 감각을 그대로 묻는다.</p>
      </Prose>

      <Quiz
        question="책상 높이 75 cm를 SI 미터로 쓰면?"
        options={[
          { label: "75 m", hint: "접두어를 빼먹음 — cm는 10⁻² m." },
          { label: "0.75 m", correct: true, hint: "75 × 10⁻² = 0.75." },
          { label: "7.5 m", hint: "10⁻¹로 잘못 환산." },
          { label: "750 m", hint: "방향을 반대로 곱함." },
        ]}
      />

      <NumericAnswer
        question="복도 표지판이 1.2 km라고 한다. 몇 m인가?"
        answer={1200}
        unit="m"
        tolerance={1}
        hint="1 km = 10³ m → 1.2 × 1000."
      />

      <Reveal label="차원 한 줄 정리">
        <Prose>
          <p>
            길이 <TeX>{String.raw`L`}</TeX>, 질량 <TeX>{String.raw`M`}</TeX>, 시간{" "}
            <TeX>{String.raw`T`}</TeX>. 힘의 차원은{" "}
            <TeX>{String.raw`[\mathrm{F}] = M L T^{-2}`}</TeX> (뉴턴 장에서 다시 만난다).
          </p>
        </Prose>
      </Reveal>
    </Lesson>
  );
}
