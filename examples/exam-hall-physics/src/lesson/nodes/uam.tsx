// Node: uam — uniformly accelerated motion (SUVAT) with sim2d track + charts.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  ParamSlider,
  Chart,
  TeX,
  Derivation,
  Callout,
  Reveal,
  Readout,
  NumericAnswer,
} from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/kit/ui/button";
import { useNode } from "@faraday-academy/kit/world";
import { SvgStage, setSvgTranslate, useSimTime } from "../sim2d";
import { InstallCta } from "../_shared/InstallCta";

const TRACK_M = 100;
const W = 560;
const H = 200;
const PLAYBACK_RATE = 2.5;

const posOf = (v0: number, a: number, t: number) => v0 * t + 0.5 * a * t * t;
const velOf = (v0: number, a: number, t: number) => v0 + a * t;

function timeToEnd(v0: number, a: number) {
  if (Math.abs(a) < 1e-9) return v0 > 0 ? TRACK_M / v0 : 20;
  const disc = v0 * v0 + 2 * a * TRACK_M;
  if (disc < 0) return 20;
  const tHit = (-v0 + Math.sqrt(disc)) / a;
  return Math.min(20, Math.max(0.05, tHit));
}

function toPix(m: number) {
  return 24 + (Math.max(0, Math.min(TRACK_M, m)) / TRACK_M) * (W - 90);
}

export default function UamLesson() {
  const { complete } = useNode();
  const [v0, setV0] = useState(8);
  const [a, setA] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [hud, setHud] = useState({ t: 0, x: 0, v: 0 });
  const carRef = useRef<SVGGElement>(null);
  const timeRef = useRef(0);
  const hudTick = useRef(0);

  const tEnd = useMemo(() => timeToEnd(v0, a), [v0, a]);

  const paint = useCallback(
    (t: number) => {
      const xM = Math.max(0, Math.min(TRACK_M, posOf(v0, a, t)));
      const v = velOf(v0, a, t);
      setSvgTranslate(carRef.current, toPix(xM), 132);
      hudTick.current += 1;
      if (hudTick.current % 3 === 0 || !playing) setHud({ t, x: xM, v });
    },
    [v0, a, playing],
  );

  useSimTime({
    playing,
    timeRef,
    until: tEnd,
    rate: PLAYBACK_RATE,
    onTick: paint,
    onComplete: () => setPlaying(false),
  });

  useEffect(() => {
    paint(timeRef.current);
  }, [v0, a, paint]);

  const samples = useMemo(() => {
    const rows: { t: number; x: number; v: number }[] = [];
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const t = (tEnd * i) / n;
      rows.push({ t: Number(t.toFixed(3)), x: posOf(v0, a, t), v: velOf(v0, a, t) });
    }
    return rows;
  }, [v0, a, tEnd]);

  // Area under v–t for this run ≈ displacement (check target).
  const areaVt = useMemo(() => {
    // ∫_0^{tEnd} (v0 + a t) dt = v0 t + ½ a t²
    return posOf(v0, a, tEnd);
  }, [v0, a, tEnd]);

  function resetRun() {
    timeRef.current = 0;
    setHud({ t: 0, x: 0, v: v0 });
    setPlaying(false);
    hudTick.current = 0;
    paint(0);
  }

  return (
    <Lesson
      topic="kinematics"
      title="등가속도 — v–t의 넓이가 변위다"
      lead="시험 그림의 직선 v–t 그래프를, 실제로 움직이는 차로 다시 그립니다."
    >
      <Prose heading="Engage">
        <p>
          문항 문장: “정지에서 출발해 등가속도로 달린다.” 번역하면{" "}
          <TeX>{String.raw`v(t)=v_0+at`}</TeX>,{" "}
          <TeX>{String.raw`x(t)=v_0 t+\tfrac12 a t^2`}</TeX>입니다. 슬라이더로{" "}
          <TeX>{String.raw`v_0, a`}</TeX>를 바꾼 뒤 Play를 눌러 궤적과 그래프가{" "}
          <em>같은 모델</em>을 말하는지 확인하세요.
        </p>
      </Prose>

      <Workbench
        title="트랙 랩"
        panelTitle="SUVAT"
        onReset={resetRun}
        hud={
          <>
            <Readout label="t" value={`${hud.t.toFixed(2)} s`} />
            <Readout label="x" value={`${hud.x.toFixed(1)} m`} />
            <Readout label="v" value={`${hud.v.toFixed(1)} m/s`} />
            <Button size="sm" onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </Button>
          </>
        }
        controls={
          <ControlGroup label="초기조건">
            <ParamSlider label="v₀ (m/s)" value={v0} min={0} max={20} step={0.5} onChange={(v) => { setV0(v); resetRun(); }} />
            <ParamSlider label="a (m/s²)" value={a} min={-4} max={6} step={0.5} onChange={(v) => { setA(v); resetRun(); }} />
          </ControlGroup>
        }
      >
        <SvgStage width={W} height={H} className="w-full">
          <line x1={24} y1={150} x2={W - 40} y2={150} stroke="var(--border)" strokeWidth={4} />
          <text x={24} y={178} className="fill-muted-foreground text-[11px]">
            0 m
          </text>
          <text x={W - 70} y={178} className="fill-muted-foreground text-[11px]">
            {TRACK_M} m
          </text>
          <g ref={carRef}>
            <rect x={-18} y={-14} width={36} height={18} rx={3} fill="var(--primary)" />
            <circle cx={-10} cy={6} r={5} fill="var(--foreground)" />
            <circle cx={10} cy={6} r={5} fill="var(--foreground)" />
          </g>
        </SvgStage>
      </Workbench>

      <Prose heading="Explore — 같은 수의 두 얼굴">
        <p>
          아래 차트는 방금 트랙과 <strong>동일한</strong>{" "}
          <TeX>{String.raw`x(t), v(t)`}</TeX>를 샘플링한 것입니다.{" "}
          <TeX>{String.raw`a>0`}</TeX>이면 v는 직선으로 올라가고, x는 위로 볼록한
          포물선이 됩니다. 감속(<TeX>{String.raw`a<0`}</TeX>)이면 반대입니다.
        </p>
      </Prose>

      <Workbench title="운동 그래프" panelTitle="표시">
        <div className="grid gap-4 p-2 md:grid-cols-2">
          <Chart type="line" data={samples} x="t" xType="number" series={[{ key: "x", label: "x(t) [m]" }]} />
          <Chart type="line" data={samples} x="t" xType="number" series={[{ key: "v", label: "v(t) [m/s]" }]} />
        </div>
      </Workbench>

      <Prose heading="Explain — 넓이 정리">
        <p>
          등가속에서 <TeX>{String.raw`v(t)`}</TeX>는 직선이므로, 0부터{" "}
          <TeX>{String.raw`t`}</TeX>까지 사다리꼴(또는 삼각형) 넓이이 곧 변위입니다.
          미적분 없이도 “그래프 아래 넓이” 규칙으로 문항을 풀 수 있는 이유가 여기
          있습니다.
        </p>
      </Prose>

      <Derivation
        title="SUVAT 한 줄 유도"
        steps={[
          { tex: String.raw`a=\frac{dv}{dt}\ \Rightarrow\ v=v_0+at`, note: "가속도 정의 (상수 a)" },
          { tex: String.raw`v=\frac{dx}{dt}\ \Rightarrow\ x=\int_0^t(v_0+at)\,dt`, note: "속도 정의" },
          { tex: String.raw`x=v_0 t+\tfrac12 a t^2`, note: "적분 — 트랙·차트가 쓰는 식" },
        ]}
      />

      <Callout title="Elaborate — 시험 함정">
        “평균 속력 = (초속+종속)/2”는 <em>등가속 직선 운동</em>에서만 안전합니다.
        방향이 바뀌거나 가속도가 바뀌면 넓이로 돌아가세요.
      </Callout>

      <Reveal label="현재 런의 변위 (모델)">
        <Prose>
          <p>
            트랙 끝(또는 정지)까지 모델 변위 ≈{" "}
            <TeX>{String.raw`${areaVt.toFixed(2)}\,\mathrm{m}`}</TeX>. HUD의{" "}
            <TeX>{String.raw`x`}</TeX>와 같은 식입니다.
          </p>
        </Prose>
      </Reveal>

      <Prose heading="Evaluate">
        <p>
          <TeX>{String.raw`v_0=10\,\mathrm{m/s}`}</TeX>,{" "}
          <TeX>{String.raw`a=2\,\mathrm{m/s^2}`}</TeX>로 두고{" "}
          <TeX>{String.raw`t=4\,\mathrm{s}`}</TeX>일 때 위치는?
        </p>
      </Prose>

      <NumericAnswer
        question="x(4 s) when v₀=10 m/s, a=2 m/s²"
        answer={48}
        tolerance={0.5}
        unit="m"
        hint="x = v0 t + ½ a t² = 10·4 + 0.5·2·16"
        onCorrect={complete}
      />

      <InstallCta topic="uniformly accelerated motion" />
    </Lesson>
  );
}
