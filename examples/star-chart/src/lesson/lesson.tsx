import { LinearCourse } from "@faraday-academy/kit/runtime";
import KeplerChapter from "@/lesson/chapters/Kepler";
import SlingshotChapter from "@/lesson/chapters/Slingshot";
import ElevatorChapter from "@/lesson/chapters/Elevator";
import DilationChapter from "@/lesson/chapters/Dilation";
import LensingChapter from "@/lesson/chapters/Lensing";
import ClocksChapter from "@/lesson/chapters/Clocks";

/**
 * 스타 차트 — 상대성·중력·시간을 만져보는 선형 코스.
 * 챕터 목차로 이동; 공간 개념은 Scene3D mood="space".
 */
export default function StarChart() {
  return (
    <LinearCourse
      title="스타 차트"
      chapters={[
        { slug: "kepler", title: "케플러 궤도", element: <KeplerChapter /> },
        { slug: "slingshot", title: "중력 슬링샷", element: <SlingshotChapter /> },
        { slug: "elevator", title: "등가원리 엘리베이터", element: <ElevatorChapter /> },
        { slug: "dilation", title: "중력 시간지연", element: <DilationChapter /> },
        { slug: "lensing", title: "빛 휨과 중력 렌즈", element: <LensingChapter /> },
        { slug: "clocks", title: "시계 맞추기", element: <ClocksChapter /> },
      ]}
    />
  );
}
