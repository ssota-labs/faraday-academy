import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  ParamSlider,
  Chart,
  Callout,
  Quiz,
  TeX,
  Derivation,
  Reveal,
  NumericAnswer,
  Readout,
  Stage,
  Compare,
} from "@faraday-academy/kit/blocks";
import { useSimLoop } from "@/lesson/sim2d";
import { gravTimeFactor } from "@/lesson/lib/physics";

export default function DilationChapter() {
  const [r, setR] = useState(3.2);
  const [rs, setRs] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);

  const factor = gravTimeFactor(r, rs);
  useSimLoop((dt) => {
    setT((prev) => prev + dt);
  }, playing);
  const farTicks = t;
  const deepTicks = t * factor;

  const curve = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const rr = rs * 1.05 + i * 0.2;
      const f = gravTimeFactor(rr, rs);
      return {
        r: Number(rr.toFixed(2)),
        rate: Number(f.toFixed(4)),
        here: Math.abs(rr - r) < 0.12 ? Number(factor.toFixed(4)) : null,
      };
    });
  }, [r, rs, factor]);

  // Two clock faces
  const farAngle = (farTicks * 40) % 360;
  const deepAngle = (deepTicks * 40) % 360;

  const height = r - rs;

  return (
    <Lesson
      topic="스타 차트 · 4"
      title="중력 시간지연"
      lead="질량에 가까울수록 시계는 더 느리게 갑니다. 높은 곳의 관측자에게는 깊은 곳의 시간이 늘어져 보입니다."
    >
      <Prose>
        <p>
          슈바르츠실트 기하에서 정지한 시계의 고유시간과 멀리서 본 좌표시간은{" "}
          <TeX>{String.raw`\mathrm{d}\tau = \sqrt{1-r_s/r}\,\mathrm{d}t`}</TeX>로 이어집니다.{" "}
          <TeX>{String.raw`r_s=2GM/c^2`}</TeX>는 슈바르츠실트 반지름입니다.
        </p>
        <p>
          높이를 바꿔 두 시계를 비교해 보세요. GPS 위성도 이 보정 없이는 위치가 어긋납니다.
        </p>
      </Prose>

      <Quiz
        question="같은 고유 1초를 재는 시계 중, 멀리서 보기에 더 느리게 가는 쪽은?"
        options={[
          { label: "중력 퍼텐셜이 높은(먼) 시계", hint: "높은 곳의 시계가 더 빠릅니다." },
          {
            label: "질량에 더 가까운(깊은) 시계",
            correct: true,
            hint: "√(1−r_s/r) 인자가 1보다 작아집니다.",
          },
          { label: "둘 다 항상 같다", hint: "특수상대론 시간지연과 다른, 중력 효과입니다." },
        ]}
      />

      <Workbench
        title="높이 ↔ 시계 속도"
        panelTitle="위치"
        onReset={() => {
          setR(3.2);
          setRs(1);
          setPlaying(true);
          setT(0);
        }}
        hud={
          <>
            <Readout label="dτ/dt" value={factor.toFixed(3)} />
            <Readout label="느림 %" value={`${((1 - factor) * 100).toFixed(1)}%`} />
          </>
        }
        controls={
          <>
            <ControlGroup label="슈바르츠실트">
              <ParamSlider label="시계 반지름 r" value={r} min={1.2} max={8} step={0.1} onChange={setR} format={(v) => v.toFixed(1)} />
              <ParamSlider label="r_s" value={rs} min={0.4} max={1.5} step={0.05} onChange={setRs} format={(v) => v.toFixed(2)} />
            </ControlGroup>
          </>
        }
      >
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <ClockFace label="먼 관측자 t" angle={farAngle} sub={`${farTicks.toFixed(1)} s`} />
          <ClockFace label={`깊은 시계 τ (r=${r.toFixed(1)})`} angle={deepAngle} sub={`${deepTicks.toFixed(1)} s`} slow />
          <svg viewBox="0 0 320 120" className="md:col-span-2 w-full" role="img" aria-label="높이 도식">
            <rect width="320" height="120" style={{ fill: "var(--card)" }} />
            <circle cx={60} cy={60} r={28} style={{ fill: "var(--chart-2)", opacity: 0.9 }} />
            <circle cx={60} cy={60} r={12} style={{ fill: "var(--background)" }} />
            <line x1={60} y1={60} x2={60 + Math.min(r, 7) * 28} y2={60} style={{ stroke: "var(--primary)", strokeWidth: 2 }} />
            <circle cx={60 + Math.min(r, 7) * 28} cy={60} r={6} style={{ fill: "var(--chart-1)" }} />
            <text x={140} y={32} style={{ fill: "var(--muted-foreground)", fontSize: 12 }}>
              {`r_s=${rs.toFixed(2)} · Δr≈${height.toFixed(2)}`}
            </text>
          </svg>
        </div>
      </Workbench>

      <Prose heading="곡선으로 읽기">
        <p>
          <TeX>{String.raw`r\to r_s^+`}</TeX>로 가면 인자는 0에 가까워지고,{" "}
          <TeX>{String.raw`r\to\infty`}</TeX>이면 1로 회복됩니다. 지금 위치는 차트에 점으로
          표시됩니다.
        </p>
      </Prose>

      <Chart
        type="line"
        height={280}
        data={curve}
        x="r"
        xType="number"
        yAxis
        legend
        series={[
          { key: "rate", label: "dτ/dt" },
          { key: "here", label: "지금 r" },
        ]}
      />

      <Derivation
        title="정지 시계의 시간지연"
        steps={[
          { tex: String.raw`\mathrm{d}s^2 = -\!\left(1-\frac{r_s}{r}\right)c^2\mathrm{d}t^2 + \cdots`, note: "슈바르츠실트 (정적)" },
          { tex: String.raw`\mathrm{d}\tau = \sqrt{1-\frac{r_s}{r}}\,\mathrm{d}t`, note: "dr=dΩ=0 인 시계" },
          { tex: String.raw`r_s=\frac{2GM}{c^2}`, note: "태양 ≈ 3 km, 지구 ≈ 9 mm" },
        ]}
      />

      <Compare
        defaultValue="gps"
        items={[
          {
            value: "gps",
            label: "GPS",
            content: (
              <Prose>
                <p>
                  위성은 지구 표면보다 약한 중력(시계가 더 빠름)과 궤도 속도(특수상대론으로 느려짐)를
                  동시에 받습니다. 중력 항이 더 커서, 보정 없이면 매일 킬로미터급 오차가 쌓입니다.
                </p>
              </Prose>
            ),
          },
          {
            value: "surface",
            label: "산과 골짜기",
            content: (
              <Prose>
                <p>
                  해발 높은 실험실의 원자시계는 저지대보다 미세하게 빠르게 갑니다. 높이 차이가
                  센티미터여도 현대 시계는 감지합니다.
                </p>
              </Prose>
            ),
          },
        ]}
      />

      <Stage caption="직관: 깊은 우물일수록 시간이 '무겁게' 흐름">
        <p className="p-4 text-sm text-muted-foreground">
          에너지만 생각하면, 아래에서 위로 빛을 쏘면 중력적색편이가 일어납니다. 진동수가 낮아진다는
          것은 아래 시계의 틱이 위보다 느리다는 말과 같습니다.
        </p>
      </Stage>

      <Callout title="한 줄 요약">
        중력 우물이 깊을수록 <TeX>{String.raw`\mathrm{d}\tau/\mathrm{d}t`}</TeX>가 작아집니다 —
        시계가 느려집니다.
      </Callout>

      <Reveal label="적색편이와의 관계">
        <p>
          정적 관찰자 사이 광신호의 진동수 비는 바로 그 시간지연 인자 비입니다:{" "}
          <TeX>{String.raw`\nu_\infty/\nu_r=\sqrt{1-r_s/r}`}</TeX>.
        </p>
      </Reveal>

      <NumericAnswer
        question="r = 2 r_s 인 정지 시계의 dτ/dt는? (√0.5 ≈ 0.707)"
        answer={0.707}
        tolerance={0.02}
        hint="√(1 − 1/2) = √0.5 ≈ 0.707"
      />

      <Quiz
        question="r을 키우면 (질량에서 멀어지면) dτ/dt는?"
        options={[
          { label: "0에 가까워진다", hint: "그건 수평선 접근입니다." },
          { label: "1에 가까워진다", correct: true, hint: "먼 관성 시계와 같아집니다." },
          { label: "r에 비례해 커져 1을 넘는다", hint: "인자는 최대 1입니다." },
        ]}
      />
    </Lesson>
  );
}

function ClockFace(props: { label: string; angle: number; sub: string; slow?: boolean }) {
  const rad = ((props.angle - 90) * Math.PI) / 180;
  const x = 60 + 40 * Math.cos(rad);
  const y = 60 + 40 * Math.sin(rad);
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">{props.label}</div>
      <svg viewBox="0 0 120 120" className="mx-auto h-32 w-32">
        <circle cx={60} cy={60} r={52} style={{ fill: "var(--muted)", stroke: "var(--border)", strokeWidth: 2 }} />
        <line x1={60} y1={60} x2={x} y2={y} style={{ stroke: props.slow ? "var(--chart-5)" : "var(--primary)", strokeWidth: 3 }} />
        <circle cx={60} cy={60} r={4} style={{ fill: "var(--foreground)" }} />
      </svg>
      <div className="mt-1 text-center font-mono text-sm tabular-nums">{props.sub}</div>
    </div>
  );
}
