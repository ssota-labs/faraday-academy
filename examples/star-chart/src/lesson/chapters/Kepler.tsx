import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  ParamSlider,
  ParamSwitch,
  Chart,
  Callout,
  Quiz,
  TeX,
  Derivation,
  Reveal,
  NumericAnswer,
  Readout,
  Stage,
} from "@faraday-academy/kit/blocks";
import { Scene3D, Body, OrbitPath, Planet, Label3D } from "@faraday-academy/three";
import { useSimLoop } from "@/lesson/sim2d";
import { keplerPeriod, keplerPosition, visViva } from "@/lesson/lib/physics";

export default function KeplerChapter() {
  const [a, setA] = useState(4.5);
  const [e, setE] = useState(0.45);
  const [speed, setSpeed] = useState(0.55);
  const [showOrbit, setShowOrbit] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);

  const period = keplerPeriod(a);
  useSimLoop((dt) => {
    setT((prev) => prev + dt * speed);
  }, playing);
  // Mean anomaly proxy — teaching approximation (uniform θ advance scaled by period).
  const theta = ((t % period) / period) * Math.PI * 2;
  const pos = keplerPosition(a, e, theta);
  const r = Math.hypot(pos.x, pos.y);
  const v = visViva(r, a);

  const sweep = useMemo(() => {
    // Equal-time wedges near periapsis vs apoapsis for Kepler II intuition
    const dTheta = 0.35;
    const near = [theta - dTheta / 2, theta + dTheta / 2];
    return { near };
  }, [theta]);

  const periodChart = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const aa = 2 + i * 0.45;
      const T = keplerPeriod(aa);
      return {
        a: Number(aa.toFixed(2)),
        a3: Number(Math.pow(aa, 3).toFixed(2)),
        T2: Number(Math.pow(T, 2).toFixed(2)),
        you: Math.abs(aa - a) < 0.23 ? Number(Math.pow(period, 2).toFixed(2)) : null,
      };
    });
  }, [a, period]);

  const peri = a * (1 - e);
  const apo = a * (1 + e);
  const vPeri = visViva(peri, a);
  const vApo = visViva(apo, a);

  const reset = () => {
    setA(4.5);
    setE(0.45);
    setSpeed(0.55);
    setShowOrbit(true);
    setPlaying(true);
    setT(0);
  };

  // SVG map of current orbit (focus at center)
  const scale = 28;
  const cx = 200;
  const cy = 140;
  const toSvg = (x: number, y: number) => ({ x: cx + x * scale, y: cy - y * scale });
  const planetSvg = toSvg(pos.x, pos.y);
  const orbitPts = Array.from({ length: 96 }, (_, i) => {
    const th = (i / 95) * Math.PI * 2;
    const p = keplerPosition(a, e, th);
    const s = toSvg(p.x, p.y);
    return `${i === 0 ? "M" : "L"}${s.x.toFixed(1)},${s.y.toFixed(1)}`;
  }).join(" ");

  const wedgeA = keplerPosition(a, e, sweep.near[0]);
  const wedgeB = keplerPosition(a, e, sweep.near[1]);
  const wA = toSvg(wedgeA.x, wedgeA.y);
  const wB = toSvg(wedgeB.x, wedgeB.y);

  return (
    <Lesson
      topic="스타 차트 · 1"
      title="케플러 궤도"
      lead="타원의 초점에 별이 있고, 같은 시간에 같은 면적을 쓸며, 주기는 반장축의 세제곱에 묶입니다."
    >
      <Prose>
        <p>
          행성은 원이 아니라 <strong>타원</strong>을 돌고, 별은 타원의 중심이 아니라{" "}
          <strong>초점</strong>에 있습니다. 이심률{" "}
          <TeX>{String.raw`e`}</TeX>를 키우면 근일점과 원일점의 거리 차이가 커지고, 그에 따라
          속도 차이도 분명해집니다.
        </p>
        <p>
          아래 3D 장면에서 궤도를 만져 보세요. 바깥쪽(더 큰{" "}
          <TeX>{String.raw`a`}</TeX>)일수록 한 바퀴에 더 오래 걸립니다 — 케플러 제3법칙 맛보기입니다.
        </p>
      </Prose>

      <Quiz
        question="타원 궤도에서 별은 어디에 있을까요?"
        options={[
          { label: "타원의 기하학적 중심", hint: "원에서는 맞지만, 타원 케플러 궤도는 초점에 질량이 있습니다." },
          { label: "타원의 한 초점", correct: true, hint: "케플러 제1법칙 — 중심체가 초점에 있습니다." },
          { label: "근일점 바로 위", hint: "근일점은 가장 가까운 지점이지, 별의 위치가 아닙니다." },
        ]}
      />

      <Workbench
        title="타원 궤도 (3D)"
        panelTitle="궤도"
        onReset={reset}
        hud={
          <>
            <Readout label="r" value={r.toFixed(2)} />
            <Readout label="v" value={v.toFixed(2)} />
            <Readout label="T" value={period.toFixed(2)} />
          </>
        }
        controls={
          <>
            <ControlGroup label="모양">
              <ParamSlider label="반장축 a" value={a} min={2.5} max={7} step={0.1} onChange={setA} format={(v) => v.toFixed(1)} />
              <ParamSlider label="이심률 e" value={e} min={0} max={0.75} step={0.01} onChange={setE} format={(v) => v.toFixed(2)} />
            </ControlGroup>
            <ControlGroup label="재생">
              <ParamSlider label="배속" value={speed} min={0.1} max={1.5} step={0.05} onChange={setSpeed} format={(v) => v.toFixed(2)} />
              <ParamSwitch label="궤도선" checked={showOrbit} onChange={setShowOrbit} />
              <ParamSwitch label="재생" checked={playing} onChange={setPlaying} />
            </ControlGroup>
          </>
        }
      >
        <Scene3D mood="space" height={420} camera={[0, 7, 12]}>
          <Body radius={0.9} color="#ffcc66" emissive="#ff9900" emissiveIntensity={0.75} />
          <Label3D position={[0, 1.5, 0]}>별 (초점)</Label3D>
          {showOrbit ? <OrbitPath a={a} e={e} /> : null}
          <Planet a={a} e={e} size={0.35} speed={speed / Math.sqrt(a)} color="#7dd3fc" phase={0} />
        </Scene3D>
      </Workbench>

      <Prose heading="근일점에서 더 빠르다">
        <p>
          같은 시간에 쓸고 지나가는 <strong>면적이 같다</strong>는 케플러 제2법칙는, 가까운 쪽에서는
          더 짧은 호를 더 빨리 지나가야 한다는 뜻입니다. 에너지 보존으로 쓰면 비스-비바 식입니다.
        </p>
      </Prose>

      <Derivation
        title="비스-비바 (vis-viva)"
        steps={[
          { tex: String.raw`E = \frac12 mv^2 - \frac{GMm}{r} = -\frac{GMm}{2a}`, note: "타원 궤도 총 에너지" },
          { tex: String.raw`v^2 = GM\!\left(\frac{2}{r}-\frac{1}{a}\right)`, note: "정리하면 순간 속력" },
          { tex: String.raw`r_\mathrm{peri}=a(1-e),\quad r_\mathrm{apo}=a(1+e)`, note: "근·원일점 거리" },
        ]}
      />

      <Stage caption={`같은 Δt 부채꼴 — 근일점 근처에서 호가 짧고 빠름 (e=${e.toFixed(2)})`}>
        <svg viewBox="0 0 400 280" role="img" aria-label="면적 일정 법칙 도식" className="w-full">
          <rect width="400" height="280" style={{ fill: "var(--card)" }} />
          <path d={orbitPts + " Z"} style={{ fill: "none", stroke: "var(--muted-foreground)", strokeWidth: 1.5, opacity: 0.5 }} />
          <path
            d={`M${cx},${cy} L${wA.x},${wA.y} L${wB.x},${wB.y} Z`}
            style={{ fill: "var(--primary)", opacity: 0.25, stroke: "var(--primary)", strokeWidth: 1 }}
          />
          <circle cx={cx} cy={cy} r={10} style={{ fill: "var(--chart-4)" }} />
          <circle cx={planetSvg.x} cy={planetSvg.y} r={7} style={{ fill: "var(--chart-1)" }} />
          <text x={16} y={24} style={{ fill: "var(--muted-foreground)", fontSize: 12 }}>
            {`근일점 v≈${vPeri.toFixed(2)} · 원일점 v≈${vApo.toFixed(2)}`}
          </text>
        </svg>
      </Stage>

      <Prose heading="제3법칙 — 주기는 크기에 묶인다">
        <p>
          반장축이 커지면 주기는 그보다 더 빠르게 늘어납니다.{" "}
          <TeX>{String.raw`T^2 \propto a^3`}</TeX> 관계를 차트에서 확인해 보세요. 파란 점이 지금
          고른 <TeX>{String.raw`a`}</TeX>입니다.
        </p>
      </Prose>

      <Chart
        type="line"
        height={280}
        data={periodChart}
        x="a3"
        xType="number"
        yAxis
        legend
        series={[
          { key: "T2", label: "T²" },
          { key: "you", label: "지금 a" },
        ]}
      />

      <Callout title="한 줄 요약">
        초점의 별 · 같은 시간·같은 면적 · <TeX>{String.raw`T^2 \propto a^3`}</TeX>. 세 법칙이 한
        타원 위에서 동시에 움직입니다.
      </Callout>

      <Reveal label="왜 T² ∝ a³인가 (힌트)">
        <p>
          구심력≈중력과 원궤도 근사에서 <TeX>{String.raw`GM/a^2 = \omega^2 a`}</TeX>이고{" "}
          <TeX>{String.raw`\omega=2\pi/T`}</TeX>이면 바로 나옵니다. 타원에서도 같은{" "}
          <TeX>{String.raw`a`}</TeX>면 같은 <TeX>{String.raw`T`}</TeX>입니다.
        </p>
      </Reveal>

      <NumericAnswer
        question="반장축을 2배로 키우면 주기 T는 약 몇 배가 될까? (√8 ≈ 2.83)"
        answer={2.83}
        tolerance={0.05}
        hint="T ∝ a^{3/2} 이므로 2^{1.5} = 2√2 ≈ 2.83"
      />

      <Quiz
        question="이심률 e를 키웠을 때 맞는 설명은?"
        options={[
          { label: "주기 T가 크게 바뀐다", hint: "T는 주로 a에 달려 있고, e에는 (제1차) 거의 무관합니다." },
          {
            label: "근일점은 더 빨라지고 원일점은 더 느려진다",
            correct: true,
            hint: "거리 차이가 커져 비스-비바 속도 대비가 커집니다.",
          },
          { label: "궤도가 원이 된다", hint: "원은 e=0입니다. e를 키우면 더 납작해집니다." },
        ]}
      />
    </Lesson>
  );
}
