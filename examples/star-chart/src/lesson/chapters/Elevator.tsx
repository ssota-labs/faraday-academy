import { useRef, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  ParamSlider,
  Segmented,
  Callout,
  Quiz,
  TeX,
  Derivation,
  Reveal,
  Compare,
  Readout,
  Stage,
} from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/kit/ui/button";
import { useSimLoop } from "@/lesson/sim2d";

type Mode = "gravity" | "accel";

export default function ElevatorChapter() {
  const [mode, setMode] = useState<Mode>("gravity");
  const [g, setG] = useState(9.8);
  const [playing, setPlaying] = useState(true);
  const ball = useRef({ y: 40, vy: 0 });
  const [, tick] = useState(0);

  const resetBall = () => {
    ball.current = { y: 40, vy: 0 };
    setPlaying(true);
  };

  useSimLoop((dt) => {
    const b = ball.current;
    // In elevator frame: both "gravity at rest" and "accel in free space" look like +g downward
    const ay = g;
    b.vy += ay * dt;
    b.y += b.vy * dt * 12; // scale to svg px/s feel
    if (b.y >= 210) {
      b.y = 210;
      b.vy = 0;
      setPlaying(false);
    }
    tick((n) => n + 1);
  }, playing);

  const y = ball.current.y;

  // Light ray bending sketch for accelerated elevator (equivalence → gravity bends light)
  const [accelLight, setAccelLight] = useState(1.2);
  const lightPath = Array.from({ length: 40 }, (_, i) => {
    const x = 40 + i * 8;
    const drop = 0.002 * accelLight * Math.pow(i * 8, 2);
    return `${i === 0 ? "M" : "L"}${x},${80 + drop}`;
  }).join(" ");

  return (
    <Lesson
      topic="스타 차트 · 3"
      title="등가원리 엘리베이터"
      lead="밀폐된 엘리베이터 안에서는, 아래로 당기는 중력과 위로 가속하는 운동을 국소적으로 구별할 수 없습니다."
    >
      <Prose>
        <p>
          아인슈타인의 <strong>등가원리</strong>는 이렇게 말합니다: 작은 실험실 안에서는{" "}
          <TeX>{String.raw`g`}</TeX>의 중력장과, 바깥에서 가속도{" "}
          <TeX>{String.raw`a=g`}</TeX>로 밀어 올리는 운동이 <em>같은 물리</em>로 보입니다.
        </p>
        <p>
          먼저 예측에 답한 뒤, 두 모드에서 공을 떨어뜨려 보세요. 궤적은 구분되지 않아야 합니다.
        </p>
      </Prose>

      <Quiz
        question="창문 없는 엘리베이터에서 공을 놓았을 때, 바닥으로 떨어지는 것만으로 알 수 있는 것은?"
        options={[
          {
            label: "지구 중력인지, 위로 가속하는 로켓인지 확실히 구분된다",
            hint: "국소적으로는 같은 가속도로 보입니다.",
          },
          {
            label: "아래로 상대가속도 g가 있다 — 원인(중력 vs 가속)은 구별 불가",
            correct: true,
            hint: "등가원리의 핵심입니다.",
          },
          { label: "공의 질량을 알 수 있다", hint: "낙하 가속도는 질량과 무관합니다(갈릴레이)." },
        ]}
      />

      <Workbench
        title="낙하 실험"
        panelTitle="설정"
        onReset={resetBall}
        hud={
          <>
            <Readout label="모드" value={mode === "gravity" ? "중력장" : "가속"} />
            <Readout label="a" value={g.toFixed(1)} />
            <Button size="sm" onClick={resetBall}>
              다시 놓기
            </Button>
          </>
        }
        controls={
          <>
            <ControlGroup label="상황">
              <Segmented
                label="프레임"
                value={mode}
                onChange={(v) => {
                  setMode(v);
                  resetBall();
                }}
                options={[
                  { value: "gravity", label: "정지+중력" },
                  { value: "accel", label: "무중력+가속" },
                ]}
              />
              <ParamSlider label="g 또는 a" value={g} min={2} max={15} step={0.5} onChange={setG} format={(v) => v.toFixed(1)} />
            </ControlGroup>
          </>
        }
      >
        <svg viewBox="0 0 280 260" className="mx-auto h-[360px] w-full max-w-md" role="img" aria-label="엘리베이터 낙하">
          <rect x={60} y={20} width={160} height={220} rx={4} style={{ fill: "var(--muted)", stroke: "var(--border)", strokeWidth: 2 }} />
          <rect x={60} y={220} width={160} height={20} style={{ fill: "var(--border)" }} />
          <text x={140} y={48} textAnchor="middle" style={{ fill: "var(--muted-foreground)", fontSize: 11 }}>
            {mode === "gravity" ? "정지 엘리베이터 · 중력 g" : "로켓 가속 a=g · 바깥은 무중력"}
          </text>
          <circle cx={140} cy={y} r={10} style={{ fill: "var(--primary)" }} />
          {mode === "accel" ? (
            <path d="M140 248 L132 236 L148 236 Z" style={{ fill: "var(--chart-4)" }} />
          ) : null}
        </svg>
      </Workbench>

      <Prose heading="같은 숫자, 다른 이야기">
        <p>
          관측자가 측정하는 것은 <TeX>{String.raw`a_{\mathrm{rel}}=g`}</TeX>뿐입니다. 스토리(지구가
          당긴다 vs 바닥이 밀어 올린다)는 창문 밖을 보기 전에는 결정되지 않습니다.
        </p>
      </Prose>

      <Compare
        defaultValue="local"
        items={[
          {
            value: "local",
            label: "국소 실험",
            content: (
              <Prose>
                <p>
                  공, 진자, 스프링 저울 — 모두 같은 유효 중력을 보고합니다. 등가원리가 말하는
                  “구별 불가”는 이 <strong>국소</strong> 창입니다.
                </p>
              </Prose>
            ),
          },
          {
            value: "tidal",
            label: "조석으로 깨짐",
            content: (
              <Prose>
                <p>
                  실험실이 커지면 중력은 균일하지 않습니다(조석). 진짜 중력장은 가속 프레임과{" "}
                  <em>전역적으로</em> 다릅니다. 등가원리는 한 점의 근사입니다.
                </p>
              </Prose>
            ),
          },
        ]}
      />

      <Prose heading="빛도 같다 — 휘어져야 한다">
        <p>
          가속 엘리베이터 옆벽의 구멍으로 빛을 넣으면, 바닥이 올라오는 동안 빛은 직선으로 가므로
          실내에서는 <strong>아래로 휘어져</strong> 보입니다. 등가원리로 옮기면: 중력장에서도 빛이
          휨니다.
        </p>
      </Prose>

      <Stage caption="가속 프레임에서 본 광선 (포물선 근사)">
        <div className="space-y-3 p-3">
          <ParamSlider
            label="가속 세기"
            value={accelLight}
            min={0}
            max={3}
            step={0.1}
            onChange={setAccelLight}
            format={(v) => v.toFixed(1)}
          />
          <svg viewBox="0 0 360 160" className="w-full" role="img" aria-label="휘는 광선">
            <rect width="360" height="160" style={{ fill: "var(--card)" }} />
            <path d={lightPath} style={{ fill: "none", stroke: "var(--chart-4)", strokeWidth: 2 }} />
            <line x1={40} y1={40} x2={40} y2={120} style={{ stroke: "var(--border)" }} />
            <line x1={320} y1={40} x2={320} y2={120} style={{ stroke: "var(--border)" }} />
            <text x={12} y={24} style={{ fill: "var(--muted-foreground)", fontSize: 11 }}>
              입사 → 실내에서 처짐
            </text>
          </svg>
        </div>
      </Stage>

      <Derivation
        title="등가 → 빛 휨 스케치"
        steps={[
          { tex: String.raw`\text{가속 엘리베이터: 빛은 관성으로 직선}`, note: "바깥 관성계" },
          { tex: String.raw`\text{실내 좌표에서는 포물선처럼 처짐}`, note: "바닥이 따라잡음" },
          { tex: String.raw`\text{등가원리} \Rightarrow \text{중력장에서도 빛 휨}`, note: "다음 챕터로 연결" },
        ]}
      />

      <Callout title="한 줄 요약">
        국소적으로 중력 = 가속. 그 대가로, 빛도 중력에 반응해야 합니다.
      </Callout>

      <Reveal label="자유 낙하 엘리베이터는?">
        <p>
          케이블이 끊겨 자유낙하하면 실내는 무중력처럼 보입니다 — 공과 관측자가 같이 가속하기
          때문입니다. 이것도 등가원리의 다른 얼굴입니다.
        </p>
      </Reveal>

      <Quiz
        question="등가원리가 함의하는 것은?"
        options={[
          { label: "빛은 중력의 영향을 받지 않는다", hint: "가속 프레임 논리가 반례입니다." },
          {
            label: "국소적으로 중력과 가속을 구별할 수 없고, 따라서 빛도 휘어야 한다",
            correct: true,
            hint: "이 챕터의 두 실험이 가리키는 결론입니다.",
          },
          { label: "중력이 없는 우주에서는 시간이 흐르지 않는다", hint: "시간 이야기는 다음 챕터입니다." },
        ]}
      />
    </Lesson>
  );
}
