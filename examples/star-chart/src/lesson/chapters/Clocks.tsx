import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  ParamSlider,
  Callout,
  Quiz,
  TeX,
  Derivation,
  Reveal,
  Challenge,
  Readout,
  Stage,
  Chart,
} from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/kit/ui/button";
import { useSimLoop } from "@/lesson/sim2d";
import { gravTimeFactor } from "@/lesson/lib/physics";

export default function ClocksChapter() {
  const rs = 1;
  const rDeep = 2.5;
  const rHigh = 5.5;
  const trueFactorDeep = gravTimeFactor(rDeep, rs);
  const trueFactorHigh = gravTimeFactor(rHigh, rs);
  // Offset the deep clock needs so that τ_deep_corrected matches high clock in far time
  // Deep clock runs slow by trueFactorDeep; to sync displayed times we add rate boost.
  const neededBoost = trueFactorHigh / trueFactorDeep; // > 1

  const [boost, setBoost] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  useSimLoop((dt) => {
    setT((prev) => prev + dt);
  }, playing);

  const highTime = t * trueFactorHigh;
  const deepRaw = t * trueFactorDeep;
  const deepCorrected = deepRaw * boost;
  const syncError = Math.abs(deepCorrected - highTime);
  const synced = Math.abs(boost - neededBoost) / neededBoost < 0.03 && syncError < 0.35;

  const series = useMemo(() => {
    const rows = [];
    for (let i = 0; i <= 30; i++) {
      const tt = (t * i) / 30 || i * 0.2;
      rows.push({
        t: Number(tt.toFixed(2)),
        high: Number((tt * trueFactorHigh).toFixed(3)),
        deep: Number((tt * trueFactorDeep * boost).toFixed(3)),
      });
    }
    return rows;
  }, [t, boost, trueFactorDeep, trueFactorHigh]);

  return (
    <Lesson
      topic="스타 차트 · 6"
      title="시계 맞추기"
      lead="높이가 다른 두 시계를 한 기준으로 맞추려면, 중력 시간지연만큼 보정해 틱을 조율해야 합니다."
    >
      <Prose>
        <p>
          지금까지의 조각을 한데 모읍니다. 깊은 시계는{" "}
          <TeX>{String.raw`\sqrt{1-r_s/r}`}</TeX> 때문에 느리게 가고, 높은 시계는 더
          빠릅니다. 네트워크·항법·과학 실험은 이 차이를 <strong>보정</strong>해 “같은 시각”을
          만듭니다.
        </p>
        <p>
          미션: 보정 배율을 조절해 두 시계의 표시 시각을 동기화하세요. 목표 배율은 약{" "}
          <TeX>{String.raw`\dot\tau_\mathrm{high}/\dot\tau_\mathrm{deep}`}</TeX>입니다.
        </p>
      </Prose>

      <Quiz
        question="깊은 시계 표시를 높은 시계에 맞추려면?"
        options={[
          { label: "깊은 시계를 더 느리게 돌린다", hint: "이미 느린데 더 늦추면 차이가 커집니다." },
          {
            label: "깊은 시계 읽기에 배율(>1)을 곱해 빨라 보이게 보정한다",
            correct: true,
            hint: "느린 고유시간을 기준 시각으로 끌어올립니다.",
          },
          { label: "보정은 불가능하다", hint: "매 순간 인자만 알면 됩니다." },
        ]}
      />

      <Challenge
        title="동기화 미션"
        goal="보정 배율을 맞춰 두 시계 표시가 함께 가게 하세요 (오차 3% 이내)."
        done={synced}
        hint={`목표 배율 ≈ ${neededBoost.toFixed(3)} (높은 dτ/dt ÷ 깊은 dτ/dt)`}
      >
        <Workbench
          title="두 고도의 시계"
          panelTitle="보정"
          onReset={() => {
            setBoost(1);
            setPlaying(true);
            setT(0);
          }}
          hud={
            <>
              <Readout label="오차" value={syncError.toFixed(3)} />
              <Readout label="배율" value={boost.toFixed(3)} />
              <Button size="sm" variant="outline" onClick={() => setPlaying((p) => !p)}>
                {playing ? "일시정지" : "재생"}
              </Button>
            </>
          }
          controls={
            <>
              <ControlGroup label="보정">
                <ParamSlider
                  label="깊은 시계 배율"
                  value={boost}
                  min={0.8}
                  max={1.8}
                  step={0.005}
                  onChange={setBoost}
                  format={(v) => v.toFixed(3)}
                />
              </ControlGroup>
            </>
          }
        >
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground">높은 시계 · r={rHigh}</div>
              <div className="mt-2 font-mono text-3xl tabular-nums text-foreground">{highTime.toFixed(2)}</div>
              <div className="mt-1 text-xs text-muted-foreground">dτ/dt = {trueFactorHigh.toFixed(3)}</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground">깊은 시계 (보정 후) · r={rDeep}</div>
              <div className="mt-2 font-mono text-3xl tabular-nums text-foreground">{deepCorrected.toFixed(2)}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                원시 {deepRaw.toFixed(2)} × {boost.toFixed(3)}
              </div>
            </div>
          </div>
        </Workbench>
      </Challenge>

      <Prose heading="오차가 줄어드는지 그래프로">
        <p>
          두 곡선이 겹칠수록 동기화에 가깝습니다. 배율을{" "}
          <TeX>{String.raw`f_\mathrm{high}/f_\mathrm{deep}`}</TeX>에 두면 이론상 일치합니다.
        </p>
      </Prose>

      <Chart
        type="line"
        height={260}
        data={series}
        x="t"
        xType="number"
        yAxis
        legend
        series={[
          { key: "high", label: "높은 τ" },
          { key: "deep", label: "깊은 τ×배율" },
        ]}
      />

      <Derivation
        title="동기화 조건"
        steps={[
          { tex: String.raw`f(r)=\sqrt{1-r_s/r}`, note: "각 고도의 지연 인자" },
          { tex: String.raw`\tau_{\mathrm{deep}}^{\mathrm{corr}} = \tau_{\mathrm{deep}}\cdot\frac{f(r_\mathrm{high})}{f(r_\mathrm{deep})}`, note: "표시 보정" },
          { tex: String.raw`\Rightarrow\ \tau_{\mathrm{deep}}^{\mathrm{corr}}=\tau_{\mathrm{high}}`, note: "같은 좌표시간 구간" },
        ]}
      />

      <Stage caption="항법·실험실에서의 쓰임">
        <p className="p-4 text-sm text-muted-foreground">
          위성·지상국·산 정상 실험실은 서로 다른 <TeX>{String.raw`f(r)`}</TeX>를 가집니다. “시계
          맞추기”는 철학이 아니라, 측위·통신·기초물리 측정의 일상 작업입니다.
        </p>
      </Stage>

      <Callout title="스타 차트 전체 요약">
        궤도와 슬링샷으로 중력이 운동을 바꾸고, 등가원리로 빛과 시간이 같은 기하에 묶이며,
        렌즈와 시간지연이 그 기하를 관측하게 합니다. 마지막에 시계를 맞추는 일이 그 모든 이야기의
        실무입니다.
      </Callout>

      <Reveal label="특수상대론 항은?">
        <p>
          움직이는 시계에는 추가로 <TeX>{String.raw`\sqrt{1-v^2/c^2}`}</TeX>가 곱합니다. 이
          챕터는 높이(중력) 항만 분리해 맞추는 연습입니다.
        </p>
      </Reveal>

      <Quiz
        question="이 코스 전체를 관통하는 한 문장은?"
        options={[
          { label: "중력은 힘일 뿐 시간·빛과는 무관하다", hint: "등가원리·렌즈·시간지연이 반례입니다." },
          {
            label: "질량이 시공간을 휘게 하고, 운동·빛·시계가 그 휘어짐을 따른다",
            correct: true,
            hint: "케플러부터 시계 맞추기까지가 가리키는 그림입니다.",
          },
          { label: "모든 시계는 어디서나 같은 속도로 간다", hint: "4·6챕터가 이를 부정합니다." },
        ]}
      />
    </Lesson>
  );
}
