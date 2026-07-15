// Node: units — measurement, significant figures, unit conversion (5E Engage/Explore).
import { useMemo, useState } from "react";
import {
  Lesson,
  Prose,
  Workbench,
  ControlGroup,
  ParamSlider,
  Segmented,
  Chart,
  TeX,
  Callout,
  Compare,
  Reveal,
  NumericAnswer,
  Readout,
  Stat,
} from "@faraday-academy/kit/blocks";
import { useNode } from "@faraday-academy/kit/world";
import { InstallCta } from "../_shared/InstallCta";

function sigFigs(value: number, figs: number): string {
  if (!Number.isFinite(value) || figs < 1) return "—";
  return Number(value).toPrecision(figs);
}

export default function UnitsLesson() {
  const { complete } = useNode();
  const [raw, setRaw] = useState(3.14159);
  const [figs, setFigs] = useState(3);
  const [fromUnit, setFromUnit] = useState<"km/h" | "m/s">("km/h");
  const [speed, setSpeed] = useState(72);

  const displayed = useMemo(() => sigFigs(raw, figs), [raw, figs]);
  const asMs = fromUnit === "km/h" ? speed / 3.6 : speed;
  const asKmh = fromUnit === "m/s" ? speed * 3.6 : speed;

  const chartData = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6].map((f) => ({
        figs: f,
        shown: Number(sigFigs(Math.PI, f)),
      })),
    [],
  );

  return (
    <Lesson
      topic="measurement"
      title="측정·단위 — 점수를 먹는 디테일"
      lead="시험장에서 가장 먼저 깎이는 건 개념이 아니라 단위와 유효숫자인 경우가 많습니다."
    >
      <Prose heading="Engage — 같은 숫자, 다른 점수">
        <p>
          계산기에는 <TeX>{String.raw`3.1415926535\ldots`}</TeX>가 가득 차 있습니다. 그런데
          문항이 “유효숫자 3개로 답하라”면 채점 기준은{" "}
          <TeX>{String.raw`3.14`}</TeX>입니다. 측정값은{" "}
          <strong>얼마나 믿을 수 있는지</strong>까지가 답의 일부입니다.
        </p>
        <p>
          아래 워크벤치에서 원본 값과 유효숫자 개수를 바꿔 보세요. 표시되는 문자열이
          어떻게 잘리는지, 그리고 자리수가 늘어날 때 그래프의 “보고된 값”이 어디로
          수렴하는지 관찰합니다.
        </p>
      </Prose>

      <Workbench
        title="유효숫자 워크벤치"
        panelTitle="Controls"
        onReset={() => {
          setRaw(3.14159);
          setFigs(3);
        }}
        hud={
          <>
            <Readout label="표시" value={displayed} />
            <Readout label="자리" value={`${figs}`} />
          </>
        }
        controls={
          <>
            <ControlGroup label="값">
              <ParamSlider
                label="원본 값"
                value={raw}
                min={0.1}
                max={100}
                step={0.01}
                onChange={setRaw}
                format={(v) => v.toFixed(4)}
              />
              <ParamSlider
                label="유효숫자"
                value={figs}
                min={1}
                max={6}
                step={1}
                onChange={setFigs}
                format={(v) => String(Math.round(v))}
              />
            </ControlGroup>
          </>
        }
      >
        <div className="flex flex-col gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            원본 <TeX>{String.raw`x = ${raw.toFixed(5)}`}</TeX> → 보고값{" "}
            <span className="font-mono text-foreground text-lg">{displayed}</span>
          </p>
          <Chart
            type="line"
            data={chartData}
            x="figs"
            xType="number"
            series={[{ key: "shown", label: "π를 n자리로" }]}
          />
        </div>
      </Workbench>

      <Prose heading="Explore — 단위 환산은 곱셈이 아니다">
        <p>
          속력 <TeX>{String.raw`72\,\mathrm{km/h}`}</TeX>를 SI로 바꾸려면{" "}
          <TeX>{String.raw`1\,\mathrm{km} = 1000\,\mathrm{m}`}</TeX>,{" "}
          <TeX>{String.raw`1\,\mathrm{h} = 3600\,\mathrm{s}`}</TeX>를 동시에 적용합니다.
          결과적으로 <TeX>{String.raw`v_\mathrm{m/s} = v_\mathrm{km/h}/3.6`}</TeX>입니다.
          “72에서 3.6을 뺀다”는 식의 오개념이 자주 나옵니다.
        </p>
      </Prose>

      <Workbench
        title="단위 환산 랩"
        panelTitle="Speed"
        onReset={() => {
          setFromUnit("km/h");
          setSpeed(72);
        }}
        hud={
          <>
            <Readout label="m/s" value={asMs.toFixed(2)} />
            <Readout label="km/h" value={asKmh.toFixed(1)} />
          </>
        }
        controls={
          <>
            <ControlGroup label="입력">
              <Segmented
                label="입력 단위"
                value={fromUnit}
                onChange={(v) => setFromUnit(v as "km/h" | "m/s")}
                options={[
                  { value: "km/h", label: "km/h" },
                  { value: "m/s", label: "m/s" },
                ]}
              />
              <ParamSlider
                label="속력"
                value={speed}
                min={1}
                max={200}
                step={1}
                onChange={setSpeed}
                format={(v) => `${Math.round(v)}`}
              />
            </ControlGroup>
          </>
        }
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Stat label="SI (m/s)" value={asMs.toFixed(3)} />
          <Stat label="일상 (km/h)" value={asKmh.toFixed(2)} />
          <p className="sm:col-span-2 text-sm text-muted-foreground">
            고속도로 표지판 <TeX>{String.raw`100\,\mathrm{km/h}`}</TeX> ≈{" "}
            <TeX>{String.raw`27.8\,\mathrm{m/s}`}</TeX>. 물리 식에는 거의 항상 SI를
            넣습니다.
          </p>
        </div>
      </Workbench>

      <Prose heading="Explain — 왜 채점이 까다로운가">
        <p>
          측정 불확도는 이후 모든 계산으로 전파됩니다. 각속도를 잘못 환산하면 구심력
          <TeX>{String.raw`mv^2/r`}</TeX>이 제곱으로 틀어집니다. 그래서 단원 0에서
          단위를 고정하는 습관이 전체 점수를 좌우합니다.
        </p>
      </Prose>

      <Compare
        defaultValue="ok"
        items={[
          {
            value: "ok",
            label: "올바른 환산",
            content: (
              <Prose>
                <p>
                  <TeX block>{String.raw`72\,\frac{\mathrm{km}}{\mathrm{h}}
                  = 72\cdot\frac{1000\,\mathrm{m}}{3600\,\mathrm{s}}
                  = 20\,\mathrm{m/s}`}</TeX>
                </p>
              </Prose>
            ),
          },
          {
            value: "bad",
            label: "흔한 실수",
            content: (
              <Prose>
                <p>
                  “72 ÷ 2 = 36 m/s”처럼 임의 계수를 쓰거나, km/h와 m/s를 한 식에 섞어
                  넣는 경우. 차원 분석으로 바로 걸립니다.
                </p>
              </Prose>
            ),
          },
        ]}
      />

      <Callout title="Elaborate">
        실험 보고서에서도 동일합니다. 원시 데이터를 모두 적은 뒤,{" "}
        <em>최종 보고값만</em> 유효숫자에 맞춥니다. 중간 계산은 한두 자리 더 남겨
        반올림 오차를 줄이세요.
      </Callout>

      <Reveal label="치트시트">
        <Prose>
          <ul>
            <li>
              <TeX>{String.raw`1\,\mathrm{km/h} = 1/3.6\,\mathrm{m/s}`}</TeX>
            </li>
            <li>
              <TeX>{String.raw`1\,\mathrm{g} \approx 9.8\,\mathrm{m/s^2}`}</TeX> (문제에서
              종종 10으로 근사)
            </li>
            <li>곱셈·나눗셈: 결과의 유효숫자는 가장 적은 쪽을 따른다.</li>
          </ul>
        </Prose>
      </Reveal>

      <Prose heading="Evaluate">
        <p>
          표지판이 <TeX>{String.raw`108\,\mathrm{km/h}`}</TeX>일 때 SI 속력은 얼마인가?
          워크벤치에서 확인한 뒤 숫자를 입력하세요.
        </p>
      </Prose>

      <NumericAnswer
        question="108 km/h 를 m/s 로 환산하면? (유효숫자 걱정은 접고 정확한 값)"
        answer={30}
        tolerance={0.05}
        unit="m/s"
        hint="108 ÷ 3.6. 워크벤치 입력을 km/h=108로 맞추면 HUD에 답이 보입니다."
        onCorrect={complete}
      />

      <InstallCta topic="measurement and unit conversion for high school physics" />
    </Lesson>
  );
}
