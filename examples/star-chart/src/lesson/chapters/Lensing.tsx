import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  ParamSlider,
  ParamSwitch,
  Callout,
  Quiz,
  TeX,
  Derivation,
  Reveal,
  Readout,
  Stage,
  Chart,
} from "@faraday-academy/kit/blocks";
import { Scene3D, Body, Label3D } from "@faraday-academy/three";
import { lightDeflection } from "@/lesson/lib/physics";

export default function LensingChapter() {
  const [b, setB] = useState(2.4);
  const [rs, setRs] = useState(1);
  const [align, setAlign] = useState(0.35);
  const [showRing, setShowRing] = useState(true);

  const alpha = lightDeflection(b, rs); // radians
  const alphaDeg = (alpha * 180) / Math.PI;

  // SVG ray: approaches from left, deflects near lens at center
  const rays = useMemo(() => {
    const paths: string[] = [];
    for (const sign of [-1, 1]) {
      const impact = b * sign;
      const pts: string[] = [];
      for (let i = 0; i <= 50; i++) {
        const t = i / 50;
        const x = -6 + t * 12;
        // hyperbolic-ish bend near x=0
        const bend = impact + Math.sign(impact) * (alpha * 3) * (0.5 + 0.5 * Math.tanh(x));
        const y = impact * (1 - 0.35 * (1 / (1 + Math.exp(-x * 1.2)))) + (bend - impact) * 0.5;
        const sx = 200 + x * 28;
        const sy = 120 - y * 28;
        pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
      }
      paths.push(pts.join(" "));
    }
    return paths;
  }, [b, alpha]);

  const chart = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const bb = 1.2 + i * 0.25;
        return {
          b: Number(bb.toFixed(2)),
          alpha: Number(((lightDeflection(bb, rs) * 180) / Math.PI).toFixed(2)),
          you: Math.abs(bb - b) < 0.15 ? Number(alphaDeg.toFixed(2)) : null,
        };
      }),
    [b, rs, alphaDeg],
  );

  // Einstein ring radius proxy ∝ sqrt(rs * D) — alignment slider collapses images
  const ringR = 0.9 + 0.5 * Math.sqrt(rs) * (1.1 - align);

  return (
    <Lesson
      topic="스타 차트 · 5"
      title="빛 휨과 중력 렌즈"
      lead="질량 옆을 스치는 빛은 휘고, 시선이 정렬되면 같은 원본이 여러 상 — 혹은 고리 — 로 보입니다."
    >
      <Prose>
        <p>
          등가원리가 예고한 대로, 빛도 중력에 반응합니다. 스치는 거리(충격 파라미터){" "}
          <TeX>{String.raw`b`}</TeX>가 작을수록 꺾임각{" "}
          <TeX>{String.raw`\alpha \approx 2 r_s / b`}</TeX>가 커집니다.
        </p>
        <p>
          먼저 광선 도형으로 휨을 느낀 뒤, 정렬을 바꿔 렌즈 상을 살펴보세요.
        </p>
      </Prose>

      <Quiz
        question="같은 질량에서 광선이 더 가까이(더 작은 b) 스치면?"
        options={[
          { label: "덜 휘어진다", hint: "α ∝ 1/b 입니다." },
          { label: "더 많이 휘어진다", correct: true, hint: "충격 파라미터가 작을수록 꺾임이 큽니다." },
          { label: "전혀 안 휘어진다 — 빛은 질량이 없다", hint: "시공간이 휘면 측지선도 휨니다." },
        ]}
      />

      <Workbench
        title="스치는 광선"
        panelTitle="기하"
        onReset={() => {
          setB(2.4);
          setRs(1);
        }}
        hud={
          <>
            <Readout label="α" value={`${alphaDeg.toFixed(1)}°`} />
            <Readout label="b" value={b.toFixed(2)} />
          </>
        }
        controls={
          <>
            <ControlGroup label="렌즈">
              <ParamSlider label="충격 b" value={b} min={1.2} max={5} step={0.1} onChange={setB} format={(v) => v.toFixed(1)} />
              <ParamSlider label="r_s" value={rs} min={0.4} max={1.8} step={0.05} onChange={setRs} format={(v) => v.toFixed(2)} />
            </ControlGroup>
          </>
        }
      >
        <svg viewBox="0 0 400 240" className="h-[320px] w-full" role="img" aria-label="광선 휨">
          <rect width="400" height="240" style={{ fill: "var(--card)" }} />
          {rays.map((d, i) => (
            <path key={i} d={d} style={{ fill: "none", stroke: "var(--chart-4)", strokeWidth: 2 }} />
          ))}
          <circle cx={200} cy={120} r={18 + rs * 8} style={{ fill: "var(--chart-2)", opacity: 0.85 }} />
          <text x={12} y={22} style={{ fill: "var(--muted-foreground)", fontSize: 12 }}>
            원본 → 렌즈 → 관측자 (꺾임 과장)
          </text>
        </svg>
      </Workbench>

      <Prose heading="꺾임각이 b에 반비례">
        <p>
          아래 차트는 근사식 <TeX>{String.raw`\alpha \approx 2 r_s/b`}</TeX>입니다. 태양 가장자리를
          스치는 별빛도 이 효과로 위치가 살짝 밀립니다.
        </p>
      </Prose>

      <Chart
        type="line"
        height={260}
        data={chart}
        x="b"
        xType="number"
        yAxis
        legend
        series={[
          { key: "alpha", label: "α (deg)" },
          { key: "you", label: "지금 b" },
        ]}
      />

      <Derivation
        title="광편향 (약한장 스케치)"
        steps={[
          { tex: String.raw`\alpha = \frac{4GM}{c^2 b} = \frac{2 r_s}{b}`, note: "스치는 광선" },
          { tex: String.raw`r_s = \frac{2GM}{c^2}`, note: "기하 단위" },
          { tex: String.raw`\theta_E \sim \sqrt{\frac{r_s D_{ls}}{D_l D_s}}`, note: "아인슈타인 각 (정렬 시)" },
        ]}
      />

      <Prose heading="정렬되면 상이 갈라진다">
        <p>
          원본·렌즈·관측자가 거의 한 직선에 있으면 같은 빛이 여러 경로로 들어와{" "}
          <strong>다중상</strong>이 생기고, 완벽한 대칭이면 <strong>아인슈타인 링</strong>이
          됩니다. 정렬 슬라이더를 줄여 보세요.
        </p>
      </Prose>

      <Workbench
        title="중력 렌즈 (3D)"
        panelTitle="정렬"
        onReset={() => {
          setAlign(0.35);
          setShowRing(true);
        }}
        hud={<Readout label="정렬 어긋남" value={align.toFixed(2)} />}
        controls={
          <>
            <ControlGroup label="시선">
              <ParamSlider label="어긋남" value={align} min={0} max={1} step={0.02} onChange={setAlign} format={(v) => v.toFixed(2)} />
              <ParamSwitch label="링/상 표시" checked={showRing} onChange={setShowRing} />
            </ControlGroup>
          </>
        }
      >
        <Scene3D mood="space" height={400} camera={[0, 2.5, 8]}>
          <Body position={[0, 0, 0]} radius={0.55} color="#94a3b8" emissive="#64748b" emissiveIntensity={0.35} />
          <Label3D position={[0, 1.1, 0]}>렌즈 질량</Label3D>
          {/* source */}
          <Body position={[-3.2, align * 1.4, 0]} radius={0.22} color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
          <Label3D position={[-3.2, align * 1.4 + 0.55, 0]}>원본</Label3D>
          {showRing ? (
            align < 0.12 ? (
              <Ring radius={ringR} />
            ) : (
              <>
                <Body position={[2.8, align * 1.1 + 0.35, 0.2]} radius={0.12} color="#7dd3fc" />
                <Body position={[2.8, -align * 1.1 - 0.25, -0.15]} radius={0.1} color="#7dd3fc" />
                <Label3D position={[2.8, 1.0, 0]}>다중상</Label3D>
              </>
            )
          ) : null}
          <Body position={[4.2, 0, 0]} radius={0.08} color="#e2e8f0" />
          <Label3D position={[4.2, 0.45, 0]}>관측</Label3D>
        </Scene3D>
      </Workbench>

      <Stage caption="링은 ‘완벽한 정렬’의 서명">
        <p className="p-4 text-sm text-muted-foreground">
          어긋남이 커지면 링은 부서지며 밝은 호·점 상으로 갈라집니다. 하늘에서 그런 호를 보면 그
          사이에 렌즈 은하가 있는 경우가 많습니다.
        </p>
      </Stage>

      <Callout title="한 줄 요약">
        질량이 시공간을 휘게 하고, 빛은 그 휘어진 길을 따릅니다 — 가까울수록 더 크게.
      </Callout>

      <Reveal label="태양 광편향 역사 (숫자)">
        <p>
          태양 가장자리 스침각은 약 <TeX>{String.raw`1.75''`}</TeX>입니다. 뉴턴식 “입자 낙하”
          예측의 두 배 — 일반상대론의 고전 검증 중 하나입니다.
        </p>
      </Reveal>

      <Quiz
        question="아인슈타인 링이 보이려면?"
        options={[
          { label: "원본이 렌즈보다 항상 가까워야 한다", hint: "거리는 필요하지만, 핵심은 시선 정렬입니다." },
          {
            label: "원본·렌즈·관측자가 거의 일직선으로 정렬",
            correct: true,
            hint: "대칭 정렬이 고리 상을 만듭니다.",
          },
          { label: "빛이 질량을 가져야 한다", hint: "측지선 이야기이지 빛의 정지질량이 아닙니다." },
        ]}
      />
    </Lesson>
  );
}

function Ring(props: { radius: number }) {
  // procedural torus-like ring via line loop of small bodies
  const n = 28;
  const nodes = Array.from({ length: n }, (_, i) => {
    const th = (i / n) * Math.PI * 2;
    return (
      <Body
        key={i}
        position={[2.6, Math.sin(th) * props.radius, Math.cos(th) * props.radius]}
        radius={0.045}
        color="#7dd3fc"
        emissive="#38bdf8"
        emissiveIntensity={0.4}
      />
    );
  });
  return <group>{nodes}</group>;
}
