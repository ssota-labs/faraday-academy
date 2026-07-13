// Node: kinematics — position, velocity, acceleration + the constant-a equations.
// sim2d: GSAP sim clock + SVG refs (no per-frame lesson setState).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Lesson, Prose, Workbench, ControlGroup, ParamSlider, Chart,
  Callout, Derivation, Readout, NumericAnswer, TeX,
} from "@faraday-academy/runtime/blocks";
import { Button } from "@faraday-academy/runtime/ui/button";
import { useNode } from "@faraday-academy/runtime/world";
import { SvgStage, setSvgTranslate, useSimTime } from "../sim2d";

const TRACK_M = 100;
const W = 560;
const H = 200;
const PLAYBACK_RATE = 2.5;

const posOf = (v0: number, a: number, t: number) => v0 * t + 0.5 * a * t * t;
const velOf = (v0: number, a: number, t: number) => v0 + a * t;

function timeToEnd(v0: number, a: number) {
  if (a === 0) return v0 > 0 ? TRACK_M / v0 : 20;
  const disc = v0 * v0 + 2 * a * TRACK_M;
  if (disc < 0) return 20;
  const tHit = (-v0 + Math.sqrt(disc)) / a;
  return Math.min(20, Math.max(0, tHit));
}

function toPix(m: number) {
  return 24 + (Math.max(0, Math.min(TRACK_M, m)) / TRACK_M) * (W - 90);
}

type TrackProps = {
  v0: number;
  a: number;
  playing: boolean;
  timeRef: React.MutableRefObject<number>;
  onPlayingChange: (p: boolean) => void;
  onHud: (hud: { t: number; x: number; v: number }) => void;
};

function KinematicsTrack({ v0, a, playing, timeRef, onPlayingChange, onHud }: TrackProps) {
  const carRef = useRef<SVGGElement>(null);
  const arrowRef = useRef<SVGLineElement>(null);
  const hudTick = useRef(0);
  const tEnd = useMemo(() => timeToEnd(v0, a), [v0, a]);

  const paint = useCallback(
    (t: number) => {
      const xM = Math.max(0, Math.min(TRACK_M, posOf(v0, a, t)));
      const v = velOf(v0, a, t);
      const cx = toPix(xM);
      setSvgTranslate(carRef.current, cx, 132);
      if (arrowRef.current) {
        const len = Math.min(80, 6 + Math.abs(v) * 4);
        const x2 = cx + (v >= 0 ? len : -len);
        arrowRef.current.setAttribute("x1", String(cx));
        arrowRef.current.setAttribute("y1", "118");
        arrowRef.current.setAttribute("x2", String(x2));
        arrowRef.current.setAttribute("y2", "118");
      }
      hudTick.current += 1;
      if (hudTick.current % 3 === 0 || !playing) onHud({ t, x: xM, v });
    },
    [v0, a, onHud, playing],
  );

  useSimTime({
    playing,
    timeRef,
    until: tEnd,
    rate: PLAYBACK_RATE,
    onTick: paint,
    onComplete: () => onPlayingChange(false),
  });

  useEffect(() => {
    paint(timeRef.current);
  }, [v0, a, paint, timeRef]);

  return (
    <SvgStage viewBox={`0 0 ${W} ${H}`} ariaLabel="Car accelerating along a track">
      <line x1={24} y1={150} x2={W - 24} y2={150} stroke="var(--border)" strokeWidth={2} />
      {[0, 25, 50, 75, 100].map((m) => (
        <g key={m}>
          <line x1={toPix(m)} y1={146} x2={toPix(m)} y2={156} stroke="var(--muted-foreground)" strokeWidth={1} />
          <text x={toPix(m)} y={172} textAnchor="middle" fontSize={11} style={{ fill: "var(--muted-foreground)" }}>
            {m} m
          </text>
        </g>
      ))}
      <line ref={arrowRef} stroke="var(--chart-2)" strokeWidth={3} markerEnd="url(#kin-arrow)" />
      <defs>
        <marker id="kin-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" style={{ fill: "var(--chart-2)" }} />
        </marker>
      </defs>
      <g ref={carRef}>
        <rect x={-16} y={-14} width={32} height={18} rx={4} style={{ fill: "var(--primary)" }} />
        <circle cx={-8} cy={6} r={4} style={{ fill: "var(--muted-foreground)" }} />
        <circle cx={8} cy={6} r={4} style={{ fill: "var(--muted-foreground)" }} />
      </g>
    </SvgStage>
  );
}

export default function Kinematics() {
  const { complete } = useNode();
  const [v0, setV0] = useState(0);
  const [a, setA] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [hud, setHud] = useState({ t: 0, x: 0, v: 0 });
  const timeRef = useRef(0);

  const curve = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => {
        const tt = (i / 24) * 6;
        return {
          t: Number(tt.toFixed(2)),
          x: Number(posOf(v0, a, tt).toFixed(2)),
          v: Number(velOf(v0, a, tt).toFixed(2)),
        };
      }),
    [v0, a],
  );

  const reset = () => {
    setPlaying(false);
    timeRef.current = 0;
    setHud({ t: 0, x: 0, v: 0 });
    setV0(0);
    setA(3);
  };

  const bumpParams = (fn: () => void) => {
    fn();
    timeRef.current = 0;
    setPlaying(false);
    setHud({ t: 0, x: 0, v: 0 });
  };

  return (
    <Lesson topic="Kinematics" title="Motion: position, velocity, acceleration"
      lead="Before forces, we need the language of motion. Position tells you where; velocity is how fast position changes; acceleration is how fast velocity changes. Drive the car and watch the three quantities move together.">
      <Prose>
        <p>
          All of mechanics rests on describing <strong>how something moves</strong> before asking{" "}
          <em>why</em>. Three quantities do the whole job. <strong>Position</strong> <TeX>{String.raw`x`}</TeX>{" "}
          locates the object. <strong>Velocity</strong> <TeX>{String.raw`v`}</TeX> is the rate at which
          position changes, <TeX>{String.raw`v = \frac{dx}{dt}`}</TeX> — its sign carries direction.{" "}
          <strong>Acceleration</strong> <TeX>{String.raw`a`}</TeX> is the rate at which{" "}
          <em>velocity</em> changes, <TeX>{String.raw`a = \frac{dv}{dt}`}</TeX>.
        </p>
        <p>
          The subtle idea students miss: acceleration is not "how fast it goes" — it is how fast the
          going itself changes. A car at a steady 30 m/s has <em>zero</em> acceleration even though it
          is moving quickly. Set the acceleration below and press Play to feel the difference. The
          orange arrow shows <TeX>{String.raw`v`}</TeX> — it lengthens as speed builds.
        </p>
      </Prose>

      <Workbench
        title="Constant-acceleration test track"
        panelTitle="Initial conditions"
        onReset={reset}
        hud={
          <div className="flex flex-col items-end gap-1.5">
            <Button
              size="sm"
              variant={playing ? "secondary" : "default"}
              onClick={() => {
                if (hud.x >= TRACK_M - 0.5) timeRef.current = 0;
                setPlaying((p) => !p);
              }}
            >
              {playing ? "Pause" : "Play"}
            </Button>
            <Readout label="t" value={`${hud.t.toFixed(2)} s`} />
            <Readout label="x" value={`${hud.x.toFixed(1)} m`} tone="primary" />
            <Readout label="v" value={`${hud.v.toFixed(1)} m/s`} />
          </div>
        }
        controls={
          <ControlGroup label="Parameters">
            <ParamSlider label="Initial velocity v₀" value={v0} min={0} max={20} step={0.5}
              onChange={(n) => bumpParams(() => setV0(n))} format={(n) => `${n} m/s`} />
            <ParamSlider label="Acceleration a" value={a} min={-4} max={6} step={0.5}
              onChange={(n) => bumpParams(() => setA(n))} format={(n) => `${n} m/s²`} />
          </ControlGroup>
        }
      >
        <KinematicsTrack
          v0={v0}
          a={a}
          playing={playing}
          timeRef={timeRef}
          onPlayingChange={setPlaying}
          onHud={setHud}
        />
      </Workbench>

      <Prose heading="Reading the two graphs">
        <p>
          The same run tells two stories. Because acceleration is constant, <strong>velocity</strong>{" "}
          grows in a straight line — equal gains in equal times. <strong>Position</strong> grows as a{" "}
          <em>parabola</em>: as the object speeds up it covers more ground each second, so the curve
          steepens. The slope of the position graph at any instant <em>is</em> the velocity on the
          velocity graph — that is the whole meaning of <TeX>{String.raw`v = dx/dt`}</TeX>.
        </p>
      </Prose>

      <Chart type="line" data={curve} x="t" xType="number" yAxis height={240}
        series={[{ key: "x", label: "position x (m)" }]} />
      <Prose>
        <p>Velocity over the same six seconds is a straight line whose slope is the acceleration:</p>
      </Prose>
      <Chart type="line" data={curve} x="t" xType="number" yAxis height={220}
        series={[{ key: "v", label: "velocity v (m/s)" }]} />

      <Prose heading="Where the equations come from">
        <p>
          Averaging the straight-line velocity over a time <TeX>{String.raw`t`}</TeX> and multiplying by{" "}
          <TeX>{String.raw`t`}</TeX> gives the displacement. Carried through, the constant-acceleration
          ("SUVAT") relations fall out:
        </p>
      </Prose>
      <Derivation title="The constant-acceleration equations" steps={[
        { tex: String.raw`v = v_0 + a\,t`, note: "velocity changes at the constant rate a" },
        { tex: String.raw`\bar v = \tfrac{1}{2}(v_0 + v)`, note: "average velocity of a straight line" },
        { tex: String.raw`\Delta x = \bar v\, t = \tfrac{1}{2}(v_0 + v)\,t`, note: "displacement = average velocity × time" },
        { tex: String.raw`\Delta x = v_0 t + \tfrac{1}{2} a t^2`, note: "substitute v = v₀ + at" },
        { tex: String.raw`v^2 = v_0^2 + 2 a\,\Delta x`, note: "eliminate t between the first and third" },
      ]} />

      <Callout title="The key idea">
        Constant acceleration ⇒ velocity is linear in time and position is quadratic. The three
        equations above are just this statement written for the unknowns you happen to be missing.
      </Callout>

      <Prose heading="Your turn">
        <p>
          A car starts <strong>from rest</strong> and accelerates at a constant{" "}
          <TeX>{String.raw`a = 3.0\ \text{m/s}^2`}</TeX>. How far does it travel in the first{" "}
          <TeX>{String.raw`t = 5.0\ \text{s}`}</TeX>? Use <TeX>{String.raw`\Delta x = v_0 t + \tfrac{1}{2}a t^2`}</TeX>{" "}
          — you can check yourself by setting v₀ = 0, a = 3 on the track and reading x at t = 5 s.
        </p>
      </Prose>
      <NumericAnswer question="Displacement of the car after 5.0 s (from rest, a = 3.0 m/s²):"
        answer={37.5} unit="m" tolerance={0.5} onCorrect={complete}
        hint="From rest v₀ = 0, so Δx = ½·a·t² = ½·3·5². Run the track to t = 5 s and read x." />
    </Lesson>
  );
}
