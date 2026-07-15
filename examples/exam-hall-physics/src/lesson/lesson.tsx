// Exam Hall Physics — secondary mechanics/waves course.
// Shell: CourseHost + linearPack (document-style TOC with unlock gates).
// Plan: .faraday/plan/exam-hall/overview.md
import { CourseHost, linearPack, type Course } from "@faraday-academy/kit/world";

import Units from "./nodes/units";
import Uam from "./nodes/uam";
import Projectile from "./nodes/projectile";
import Newton from "./nodes/newton";
import Circular from "./nodes/circular";
import Energy from "./nodes/energy";
import Waves from "./nodes/waves";
import Mock from "./nodes/mock";

// Module scope — REQUIRED. Recreating this object inside the component resets progress.
const course: Course = {
  title: "시험장의 물리",
  nodes: [
    {
      id: "units",
      title: "1. 측정·단위",
      summary: "유효숫자와 단위 환산이 점수를 먹는다.",
      reward: { xp: 10 },
      lesson: <Units />,
    },
    {
      id: "uam",
      title: "2. 등가속도",
      summary: "v–t 아래 넓이 = 변위. 자동차 랩으로 확인.",
      requires: ["units"],
      reward: { xp: 15 },
      lesson: <Uam />,
    },
    {
      id: "projectile",
      title: "3. 포물선 운동",
      summary: "발사각만 바꿔 사거리 최댓값을 찾아라.",
      requires: ["uam"],
      reward: { xp: 15 },
      lesson: <Projectile />,
    },
    {
      id: "newton",
      title: "4. 뉴턴·알짜힘",
      summary: "힘 벡터를 합치면 가속 방향이 보인다.",
      requires: ["units"],
      reward: { xp: 15 },
      lesson: <Newton />,
    },
    {
      id: "circular",
      title: "5. 원운동",
      summary: "장력과 구심력이 같은 힘의 다른 이름일 때.",
      requires: ["newton"],
      reward: { xp: 15 },
      lesson: <Circular />,
    },
    {
      id: "energy",
      title: "6. 역학적 에너지",
      summary: "마찰이 있으면 ‘사라진’ 에너지의 행방.",
      requires: ["projectile", "circular"],
      reward: { xp: 20 },
      lesson: <Energy />,
    },
    {
      id: "waves",
      title: "7. 파동·간섭",
      summary: "두 원이 겹칠 때 보강과 상쇄가 눈에 보인다.",
      requires: ["energy"],
      reward: { xp: 15 },
      lesson: <Waves />,
    },
    {
      id: "mock",
      title: "8. 미니 모의고사",
      summary: "blueprint 기반 4문항 — 결과를 복습으로.",
      requires: ["waves"],
      reward: { xp: 30 },
      lesson: <Mock />,
    },
  ],
};

export default function ExamHallPhysics() {
  return <CourseHost course={course} pack={linearPack} />;
}
