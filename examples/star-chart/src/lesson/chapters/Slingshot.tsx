import { useMemo, useRef, useState } from "react";
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
  Readout,
  Stage,
} from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/kit/ui/button";
import { useSimLoop } from "@/lesson/sim2d";

type BodyState = { x: number; y: number; vx: number; vy: number };

/** Softened 2-body: probe around a moving planet (planet on +x flyby). */
function accel(p: BodyState, planet: { x: number; y: number }, mu: number, soft = 0.35) {
  const dx = planet.x - p.x;
  const dy = planet.y - p.y;
  const r2 = dx * dx + dy * dy + soft * soft;
  const r = Math.sqrt(r2);
  const f = mu / (r2 * r);
  return { ax: f * dx, ay: f * dy };
}

export default function SlingshotChapter() {
  const [approach, setApproach] = useState(1.4);
  const [aimY, setAimY] = useState(-2.2);
  const [mu, setMu] = useState(2.8);
  const [playing, setPlaying] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [speedLog, setSpeedLog] = useState<{ t: number; v: number; vInf: number }[]>([]);

  const probe = useRef<BodyState>({ x: -8, y: aimY, vx: approach, vy: 0 });
  const planet = useRef({ x: 0, y: 0, vx: 0.55 }); // planet moving +x (heliocentric sketch)
  const tRef = useRef(0);
  const logEvery = useRef(0);

  const resetSim = (autoPlay = false) => {
    probe.current = { x: -8, y: aimY, vx: approach, vy: 0 };
    planet.current = { x: 0, y: 0, vx: 0.55 };
    tRef.current = 0;
    logEvery.current = 0;
    setTrail([{ x: -8, y: aimY }]);
    setSpeedLog([{ t: 0, v: approach, vInf: approach }]);
    setPlaying(autoPlay);
  };

  useSimLoop((dt) => {
    const p = probe.current;
    const pl = planet.current;
    // Planet drifts slowly +x (sunward frame sketch)
    pl.x += pl.vx * dt;
    const a = accel(p, pl, mu);
    p.vx += a.ax * dt;
    p.vy += a.ay * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    tRef.current += dt;
    logEvery.current += dt;
    if (logEvery.current > 0.08) {
      logEvery.current = 0;
      const v = Math.hypot(p.vx, p.vy);
      // Planet-relative "infinity" proxy: speed in sun frame vs planet frame
      const vRel = Math.hypot(p.vx - pl.vx, p.vy);
      setTrail((tr) => [...tr.slice(-120), { x: p.x, y: p.y }]);
      setSpeedLog((log) => [
        ...log.slice(-80),
        { t: Number(tRef.current.toFixed(2)), v: Number(v.toFixed(3)), vInf: Number(vRel.toFixed(3)) },
      ]);
    }
    if (p.x > 10 || Math.hypot(p.x, p.y) > 16) setPlaying(false);
  }, playing);

  const now = probe.current;
  const vNow = Math.hypot(now.vx, now.vy);
  const v0 = approach;

  const scale = 22;
  const cx = 200;
  const cy = 150;
  const toSvg = (x: number, y: number) => ({ x: cx + x * scale, y: cy - y * scale });
  const probeS = toSvg(now.x, now.y);
  const planetS = toSvg(planet.current.x, planet.current.y);
  const trailD = trail
    .map((pt, i) => {
      const s = toSvg(pt.x, pt.y);
      return `${i === 0 ? "M" : "L"}${s.x.toFixed(1)},${s.y.toFixed(1)}`;
    })
    .join(" ");

  const chartData = useMemo(
    () => speedLog.map((row) => ({ ...row, launch: v0 })),
    [speedLog, v0],
  );

  return (
    <Lesson
      topic="스타 차트 · 2"
      title="중력 슬링샷"
      lead="행성을 스치듯 지나가며 운동량을 나눠 가져, 태양계 기준으로 속력을 키우거나 줄입니다."
    >
      <Prose>
        <p>
          탐사선이 행성 옆을 지나면, <strong>행성 기준</strong>으로는 접근·이탈 속력이 거의
          같지만(탄성 산란), 행성이 태양 주위로 움직이므로 <strong>태양 기준</strong> 속력은 바뀔 수
          있습니다. 뒤쪽에서 쫓아가듯 스치면 가속, 앞에서 마주치면 감속입니다.
        </p>
        <p>
          조준 높이(충격 파라미터)와 접근 속력을 고른 뒤 <strong>발사</strong>해 궤적과 속력
          그래프를 읽으세요.
        </p>
      </Prose>

      <Quiz
        question="행성 근처를 스칠 때, 행성 정지 좌표계에서 접근·이탈 속력은?"
        options={[
          { label: "이탈이 항상 더 빠르다", hint: "행성만 보면 중력은 보존력이라 속력은 대칭에 가깝습니다." },
          {
            label: "거의 같다 (산란 전후 대칭)",
            correct: true,
            hint: "슬링샷의 '공짜 에너지'는 행성 운동에서 옵니다.",
          },
          { label: "항상 0이 된다", hint: "포획이 아니라면 다시 멀어집니다." },
        ]}
      />

      <Workbench
        title="행성 조우"
        panelTitle="조준"
        onReset={() => resetSim(false)}
        hud={
          <>
            <Readout label="|v|" value={vNow.toFixed(2)} tone={vNow > v0 + 0.15 ? "primary" : undefined} />
            <Readout label="Δv" value={(vNow - v0).toFixed(2)} />
            <Button size="sm" onClick={() => resetSim(true)}>
              발사
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPlaying((p) => !p)}>
              {playing ? "일시정지" : "계속"}
            </Button>
          </>
        }
        controls={
          <>
            <ControlGroup label="접근">
              <ParamSlider
                label="접근 속력"
                value={approach}
                min={0.6}
                max={2.4}
                step={0.05}
                onChange={(v) => {
                  setApproach(v);
                  resetSim(false);
                }}
                format={(v) => v.toFixed(2)}
              />
              <ParamSlider
                label="조준 y"
                value={aimY}
                min={-4}
                max={4}
                step={0.1}
                onChange={(v) => {
                  setAimY(v);
                  resetSim(false);
                }}
                format={(v) => v.toFixed(1)}
              />
            </ControlGroup>
            <ControlGroup label="행성">
              <ParamSlider label="μ (GM)" value={mu} min={1} max={5} step={0.1} onChange={setMu} format={(v) => v.toFixed(1)} />
              <ParamSwitch label="재생" checked={playing} onChange={setPlaying} />
            </ControlGroup>
          </>
        }
      >
        <svg viewBox="0 0 400 300" className="h-[360px] w-full" role="img" aria-label="슬링샷 궤적">
          <rect width="400" height="300" style={{ fill: "var(--card)" }} />
          <line x1={0} y1={cy} x2={400} y2={cy} style={{ stroke: "var(--border)" }} />
          <path d={trailD} style={{ fill: "none", stroke: "var(--chart-1)", strokeWidth: 2, opacity: 0.85 }} />
          <circle cx={planetS.x} cy={planetS.y} r={16} style={{ fill: "var(--chart-2)" }} />
          <circle cx={probeS.x} cy={probeS.y} r={5} style={{ fill: "var(--primary)" }} />
          {/* planet velocity hint */}
          <line
            x1={planetS.x}
            y1={planetS.y}
            x2={planetS.x + 28}
            y2={planetS.y}
            style={{ stroke: "var(--chart-4)", strokeWidth: 2 }}
            markerEnd="url(#arrow)"
          />
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" style={{ fill: "var(--chart-4)" }} />
            </marker>
          </defs>
          <text x={12} y={20} style={{ fill: "var(--muted-foreground)", fontSize: 12 }}>
            행성 → (공전 방향) · 탐사선 궤적
          </text>
        </svg>
      </Workbench>

      <Prose heading="태양 기준 속력이 바뀌는 이유">
        <p>
          행성 프레임에서는 쌍곡선 산란으로 방향만 꺾입니다. 그 결과를 다시 태양 프레임으로
          변환하면, 행성의 속도 벡터가 더해지거나 빠져{" "}
          <TeX>{String.raw`|\vec v_\odot|`}</TeX>가 변합니다.
        </p>
      </Prose>

      <Derivation
        title="프레임 변환 스케치"
        steps={[
          { tex: String.raw`\vec v_\odot = \vec v_{\mathrm{planet}} + \vec v_{\mathrm{rel}}`, note: "갈릴레이 합성" },
          { tex: String.raw`|\vec v_{\mathrm{rel}}^{\mathrm{in}}|\approx|\vec v_{\mathrm{rel}}^{\mathrm{out}}|`, note: "행성 프레임 보존" },
          { tex: String.raw`\Delta\vec v_\odot \neq 0 \text{ (방향이 바뀌면)}`, note: "벡터 합이 달라짐" },
        ]}
      />

      <Chart
        type="line"
        height={260}
        data={chartData}
        x="t"
        xType="number"
        yAxis
        legend
        series={[
          { key: "v", label: "태양틀 |v|" },
          { key: "launch", label: "발사 속력" },
        ]}
      />

      <Stage caption="직관: 뒤쪽에서 추월하듯 스치면 가속, 정면 조우면 감속">
        <div className="grid gap-3 p-4 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            <strong className="text-foreground">가속 조우</strong> — 행성이 앞서 가고, 탐사선이
            뒤쪽 내측을 스침 → 공전 방향으로 튕기며 <TeX>{String.raw`|\vec v_\odot|`}</TeX> 증가.
          </p>
          <p>
            <strong className="text-foreground">감속 조우</strong> — 마주 오며 앞쪽을 스침 → 공전
            반대 성분 → 속력 감소(대기권 진입·포획 준비에 쓰임).
          </p>
        </div>
      </Stage>

      <Callout title="한 줄 요약">
        슬링샷은 “행성의 운동량 은행”입니다. 중력은 에너지를 만들지 않고,{" "}
        <strong>행성과 나눠 가집니다</strong>.
      </Callout>

      <Reveal label="왜 행성은 거의 안 느려지나">
        <p>
          질량비가 거대해서 행성이 잃는 속력은 무시할 만합니다. 탐사선에게는 큰{" "}
          <TeX>{String.raw`\Delta v`}</TeX>, 행성에게는 티끌입니다.
        </p>
      </Reveal>

      <Quiz
        question="태양 기준 속력이 커지려면?"
        options={[
          { label: "행성을 정면으로 들이받아 멈춘다", hint: "그건 충돌이지 중력 지원이 아닙니다." },
          {
            label: "행성 공전 방향으로 꺾이도록 뒤쪽에서 스친다",
            correct: true,
            hint: "행성 속도가 탐사선에 더해지는 기하입니다.",
          },
          { label: "행성과 멀수록 무조건 더 빨라진다", hint: "너무 멀면 거의 안 꺾입니다." },
        ]}
      />
    </Lesson>
  );
}
