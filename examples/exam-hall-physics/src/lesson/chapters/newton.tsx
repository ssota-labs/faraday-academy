// Chapter 4 — 뉴턴의 법칙
// Outcome: ΣF=ma로 알짜힘·가속도 관계를 시험장 책상·가방 상황에 적용한다.
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
  Quiz,
  NumericAnswer,
  TeX,
  Readout,
  Compare,
  Reveal,
} from "@faraday-academy/kit/blocks";

export default function NewtonChapter() {
  const [mass, setMass] = useState(4);
  const [push, setPush] = useState(12);
  const [friction, setFriction] = useState(3);

  const Fnet = push - friction;
  const a = mass > 0 ? Fnet / mass : 0;

  const chartData = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => {
        const F = i;
        return { F, a: mass > 0 ? (F - friction) / mass : 0 };
      }),
    [mass, friction],
  );

  // Check: m=5 kg, F=20 N, f=5 N → a = 15/5 = 3
  const checkA = 3;

  return (
    <Lesson
      topic="시험장의 물리 · 4"
      title="뉴턴의 법칙"
      lead="책상 위 필통을 밀 때, 왜 힘과 가속도는 비례하고 질량과는 반비례할까?"
    >
      <Prose heading="Engage — 무거운 가방 vs 가벼운 필통">
        <p>
          같은 힘으로 밀어도 무거운 가방은 천천히 움직인다. 「힘이 곧 속도」라는
          중세적 직관(임페투스)과 달리, 뉴턴은 <strong>힘이 가속도를 만든다</strong>고
          말한다.
        </p>
      </Prose>

      <Prose heading="Explore — 알짜힘 실험">
        <p>
          미는 힘과 마찰, 질량을 바꿔 보라. 알짜힘이 0이면 가속도가 사라지는지,
          질량을 두 배로 하면 가속도가 절반이 되는지 확인한다.
        </p>
      </Prose>

      <Workbench
        title="책상 위 물체"
        onReset={() => {
          setMass(4);
          setPush(12);
          setFriction(3);
        }}
        hud={
          <>
            <Readout label="ΣF" value={`${Fnet.toFixed(1)} N`} />
            <Readout label="a" value={`${a.toFixed(2)} m/s²`} tone="primary" />
            <Readout label="상태" value={Math.abs(Fnet) < 1e-6 ? "등속도(또는 정지)" : "가속"} />
          </>
        }
        controls={
          <ControlGroup label="힘과 질량">
            <ParamSlider
              label="질량 m"
              value={mass}
              min={1}
              max={12}
              step={0.5}
              onChange={setMass}
              format={(n) => `${n.toFixed(1)} kg`}
            />
            <ParamSlider
              label="미는 힘 F"
              value={push}
              min={0}
              max={30}
              step={0.5}
              onChange={setPush}
              format={(n) => `${n.toFixed(1)} N`}
            />
            <ParamSlider
              label="마찰 f"
              value={friction}
              min={0}
              max={20}
              step={0.5}
              onChange={setFriction}
              format={(n) => `${n.toFixed(1)} N`}
            />
          </ControlGroup>
        }
      >
        <svg viewBox="0 0 640 200" role="img" aria-label="힘 화살표 다이어그램">
          <rect x={40} y={140} width={560} height={12} rx={2} style={{ fill: "var(--muted)" }} />
          <rect
            x={280}
            y={100}
            width={60 + mass * 4}
            height={40}
            rx={4}
            style={{ fill: "var(--primary)" }}
          />
          {/* push arrow */}
          <line
            x1={280}
            y1={120}
            x2={280 - Math.min(120, push * 4)}
            y2={120}
            stroke="var(--chart-1)"
            strokeWidth={4}
            markerEnd="url(#arr)"
          />
          <text x={200} y={90} fontSize={12} style={{ fill: "var(--chart-1)" }}>
            F = {push.toFixed(1)} N
          </text>
          {/* friction */}
          <line
            x1={340 + mass * 4}
            y1={120}
            x2={340 + mass * 4 + Math.min(100, friction * 4)}
            y2={120}
            stroke="var(--chart-5)"
            strokeWidth={4}
          />
          <text x={400} y={90} fontSize={12} style={{ fill: "var(--chart-5)" }}>
            f = {friction.toFixed(1)} N
          </text>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" style={{ fill: "var(--chart-1)" }} />
            </marker>
          </defs>
        </svg>
      </Workbench>

      <Prose heading="Explain — 제2법칙">
        <p>
          알짜힘 <TeX>{String.raw`\sum \vec F`}</TeX>가 가속도를 만든다. 질량은
          가속에 대한 저항(관성)이다.
        </p>
      </Prose>

      <Derivation
        title="ΣF = ma"
        steps={[
          { tex: String.raw`\sum F = F_{\text{push}} - f`, note: "1차원 알짜힘" },
          { tex: String.raw`a = \dfrac{\sum F}{m}`, note: "제2법칙 재배열" },
          {
            tex: String.raw`\sum F = 0 \;\Rightarrow\; a = 0`,
            note: "제1법칙: 등속도(관성)",
          },
        ]}
      />

      <Prose heading="Elaborate — F–a 직선">
        <p>
          마찰을 고정한 채 미는 힘만 바꾸면{" "}
          <TeX>{String.raw`a = (F-f)/m`}</TeX>이므로 그래프는 직선이고, 기울기는{" "}
          <TeX>{String.raw`1/m`}</TeX>이다.
        </p>
      </Prose>

      <Chart
        type="line"
        data={chartData}
        x="F"
        xType="number"
        yAxis
        series={[{ key: "a", label: "a (m/s²)" }]}
      />

      <Compare
        defaultValue="pair"
        items={[
          {
            value: "pair",
            label: "제3법칙",
            content: (
              <Prose>
                <p>
                  당신이 책상을 밀면 책상도 당신을 같은 크기의 힘으로 민다. 작용·반작용은{" "}
                  <strong>다른 물체</strong>에 작용하므로 한 물체의 알짜힘에서 서로
                  상쇄되지 않는다.
                </p>
              </Prose>
            ),
          },
          {
            value: "myth",
            label: "오개념",
            content: (
              <Prose>
                <p>
                  「작용·반작용이 상쇄되어 움직이지 않는다」는 틀림. 두 힘은 각각 다른
                  물체에 걸린다.
                </p>
              </Prose>
            ),
          },
        ]}
      />

      <Callout title="시험장 팁">
        자유물체도(FBD)를 그린 뒤 성분을 합산하라. 식을 외우기 전에 화살표부터.
      </Callout>

      <NumericAnswer
        question="m=5 kg, F=20 N, f=5 N일 때 가속도 a (m/s²)는?"
        answer={checkA}
        unit="m/s²"
        tolerance={0.05}
        hint="ΣF = 20−5 = 15 N → a = 15/5 = 3."
      />

      <Quiz
        question="알짜힘이 0일 때 물체의 운동은?"
        options={[
          { label: "반드시 정지", hint: "정지는 등속도의 특수 경우일 뿐." },
          {
            label: "등속도(정지 포함)",
            correct: true,
            hint: "제1법칙 — 가속도만 0.",
          },
          { label: "등가속도", hint: "알짜힘이 0이 아닐 때." },
          { label: "원운동만 가능", hint: "구심력이 있으면 알짜힘 ≠ 0." },
        ]}
      />

      <Reveal label="제3법칙 한 줄">
        <Prose>
          <p>
            <TeX>{String.raw`\vec F_{12} = -\vec F_{21}`}</TeX> — 크기 같고 방향
            반대, <em>다른</em> 두 물체.
          </p>
        </Prose>
      </Reveal>
    </Lesson>
  );
}
