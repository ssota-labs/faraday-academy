// 시험장의 물리 — linear chapter course (목차형).
// Audience: 수능 물리 준비 고등학생 (5E). Plan: .faraday/plan/exam-hall-physics/
import { Course } from "@faraday-academy/kit/runtime";
import Measurement from "./chapters/measurement";
import Acceleration from "./chapters/acceleration";
import Projectile from "./chapters/projectile";
import Newton from "./chapters/newton";
import Circular from "./chapters/circular";
import Energy from "./chapters/energy";
import Waves from "./chapters/waves";
import MockExam from "./chapters/mock-exam";

export default function ExamHallPhysics() {
  return (
    <Course
      title="시험장의 물리"
      chapters={[
        { slug: "measurement", title: "측정과 단위", element: <Measurement /> },
        { slug: "acceleration", title: "등가속도", element: <Acceleration /> },
        { slug: "projectile", title: "포물선", element: <Projectile /> },
        { slug: "newton", title: "뉴턴", element: <Newton /> },
        { slug: "circular", title: "원운동", element: <Circular /> },
        { slug: "energy", title: "역학적 에너지", element: <Energy /> },
        { slug: "waves", title: "파동", element: <Waves /> },
        { slug: "mock-exam", title: "모의고사", element: <MockExam /> },
      ]}
    />
  );
}
