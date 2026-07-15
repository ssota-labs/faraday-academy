// Chapter 7 — 파동
// Outcome: v=fλ, 반사·중첩의 기본을 종소리·줄 파동 상황에 적용한다.
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

export default function WavesChapter() {
  const [f, setF] = useState(2.5); // Hz
  const [lambda, setLambda] = useState(1.2); // m
  const [amp, setAmp] = useState(1);
  const [phase, setPhase] = useState(0);

  const v = f * lambda;

  const wavePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = (i / 80) * 4 * lambda;
      const y = amp * Math.sin(((2 * Math.PI) / lambda) * x - phase);
      pts.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
    }
    return pts;
  }, [lambda, amp, phase]);

  const chartData = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const ff = 0.5 + i * 0.25;
        return { f: ff, v: ff * lambda };
      }),
    [lambda],
  );

  // Check: f=440, λ=0.78 → v ≈ 343.2
  const checkV = 440 * 0.78;

  return (
    <Lesson
      topic="시험장의 물리 · 7"
      title="파동"
      lead="종소리가 복도를 타고 올 때, 무엇이 전달되고 무엇이 전달되지 않을까?"
    >
      <Prose heading="Engage — 종소리">
        <p>
          시험 시작 종은 공기의 <strong>진동</strong>을 퍼뜨린다. 공기가 고사실까지
          날아가는 것이 아니라, 교란(위상)이 전달된다. 파동의 핵심은{" "}
          <TeX>{String.raw`v = f\lambda`}</TeX>.
        </p>
      </Prose>

      <Prose heading="Explore — 파장과 진동수">
        <p>
          진폭·파장·위상을 바꿔 파형을 보라. 진동수를 올리면 같은 파장에서
          파동 속력이 커진다(매질이 바뀌지 않는 한, 실제로는 매질이{" "}
          <TeX>{String.raw`v`}</TeX>를 정한다).
        </p>
      </Prose>

      <Workbench
        title="횡파 스냅샷"
        onReset={() => {
          setF(2.5);
          setLambda(1.2);
          setAmp(1);
          setPhase(0);
        }}
        hud={
          <>
            <Readout label="f" value={`${f.toFixed(2)} Hz`} />
            <Readout label="λ" value={`${lambda.toFixed(2)} m`} />
            <Readout label="v" value={`${v.toFixed(2)} m/s`} tone="primary" />
          </>
        }
        controls={
          <ControlGroup label="파동 파라미터">
            <ParamSlider
              label="진동수 f"
              value={f}
              min={0.5}
              max={6}
              step={0.1}
              onChange={setF}
              format={(n) => `${n.toFixed(1)} Hz`}
            />
            <ParamSlider
              label="파장 λ"
              value={lambda}
              min={0.4}
              max={3}
              step={0.1}
              onChange={setLambda}
              format={(n) => `${n.toFixed(1)} m`}
            />
            <ParamSlider
              label="진폭 A"
              value={amp}
              min={0.2}
              max={2}
              step={0.1}
              onChange={setAmp}
            />
            <ParamSlider
              label="위상"
              value={phase}
              min={0}
              max={6.28}
              step={0.1}
              onChange={setPhase}
            />
          </ControlGroup>
        }
      >
        <svg viewBox="0 0 640 200" role="img" aria-label="정현파">
          <line x1={40} y1={100} x2={600} y2={100} stroke="var(--border)" />
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            points={wavePoints
              .map((p, i) => {
                const x = 40 + (i / 80) * 560;
                const y = 100 - p.y * 40;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {/* one wavelength marker */}
          <line
            x1={40}
            y1={170}
            x2={40 + (560 * lambda) / (4 * lambda)}
            y2={170}
            stroke="var(--chart-2)"
            strokeWidth={3}
          />
          <text x={80} y={190} fontSize={11} style={{ fill: "var(--muted-foreground)" }}>
            한 파장 λ
          </text>
        </svg>
      </Workbench>

      <Prose heading="Explain — 기본 관계">
        <p>
          한 주기 <TeX>{String.raw`T=1/f`}</TeX> 동안 파가 한 파장만큼 진행하므로
          속력은 파장×진동수다.
        </p>
      </Prose>

      <Derivation
        title="v = fλ"
        steps={[
          { tex: String.raw`T = 1/f`, note: "주기" },
          {
            tex: String.raw`v = \dfrac{\lambda}{T}`,
            note: "한 주기 동안 λ만큼 진행",
          },
          { tex: String.raw`v = f\lambda`, note: "파동의 기본식" },
        ]}
      />

      <Prose heading="Elaborate — f에 따른 v (λ 고정)">
        <p>
          파장을 고정한 채 진동수만 바꾸면 속력 그래프는 원점을 지나는 직선이다.
          (실제 소리에서는 매질이 <TeX>{String.raw`v`}</TeX>를 거의 고정하고{" "}
          <TeX>{String.raw`\lambda`}</TeX>가 바뀐다 — 아래 Compare.)
        </p>
      </Prose>

      <Chart
        type="line"
        data={chartData}
        x="f"
        xType="number"
        yAxis
        series={[{ key: "v", label: "v (m/s)" }]}
      />

      <Compare
        defaultValue="string"
        items={[
          {
            value: "string",
            label: "줄 파동",
            content: (
              <Prose>
                <p>
                  장력·선밀도가 속력을 정한다:{" "}
                  <TeX>{String.raw`v=\sqrt{T/\mu}`}</TeX>. 진동수를 바꾸면 주로
                  파장이 맞춰진다.
                </p>
              </Prose>
            ),
          },
          {
            value: "sound",
            label: "공기 중 소리",
            content: (
              <Prose>
                <p>
                  상온 공기에서 <TeX>{String.raw`v\approx 340\,\mathrm{m/s}`}</TeX>.
                  높은 음(큰 <TeX>{String.raw`f`}</TeX>)은 짧은 파장.
                </p>
              </Prose>
            ),
          },
        ]}
      />

      <Callout title="오개념">
        「파동이 에너지를 나르지 않는다」는 틀림. 매질 입자는 제자리에서 진동하지만
        에너지는 전달된다.
      </Callout>

      <NumericAnswer
        question="f=440 Hz, λ=0.78 m일 때 파동 속력 v (m/s)는?"
        answer={checkV}
        unit="m/s"
        tolerance={1}
        hint="v = fλ = 440 × 0.78 = 343.2."
      />

      <Quiz
        question="종파(소리)에서 매질 입자의 진동 방향은?"
        options={[
          {
            label: "진행 방향과 나란하다",
            correct: true,
            hint: "소밀파 — 종파의 정의.",
          },
          { label: "진행 방향에 수직", hint: "그건 횡파(줄·빛 편광)." },
          { label: "항상 중력 방향", hint: "방향은 파의 종류에 달림." },
          { label: "진동하지 않는다", hint: "파동의 정의에 반함." },
        ]}
      />
    </Lesson>
  );
}
