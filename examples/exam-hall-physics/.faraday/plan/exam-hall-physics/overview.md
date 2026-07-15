# 시험장의 물리 — plan overview

## Discover brief (assumptions — creator asked us to proceed)

- **Audience:** 한국 고등학생, 수능(CSAT) 물리 준비. Secondary → **5E** (Engage → Explore → Explain → Elaborate → Evaluate).
- **Goal:** 시험장·등교 상황을 소재로 측정·운동학·역학·파동 개념을 적용하고, 짧은 모의고사로 단원 통합을 확인한다.
- **Scope:** 선형 챕터 코스 (`<Course>` / LinearCourse). 게임 맵 아님.
- **Assessment:** 챕터별 Quiz/NumericAnswer + 마지막 모의고사(exam pack).
- **Methodology:** lecture-design 기본 + audience 5E. 실제 기출 문장 비복사 — 유사 상황만.
- **Language:** 한국어.

## Packs

- Keep: `audience`, `lecture-design`, `exam`, `sim2d`
- Removed: `three`, `tutor`, `game2d`, `storybook-game2d`, `notes`, `srs`, `slide-view`, `textbook-view`, `map2d` (not added)

## Shape

`<Course title chapters={[…]}>` — 목차형 챕터 네비.

## Sequence (dependency order)

측정·단위 → 등가속도 → 포물선 → 뉴턴 → 원운동 → 역학적 에너지 → 파동 → 모의고사

| id | title | requires | check | packs | status |
|----|-------|----------|-------|-------|--------|
| measurement | 측정과 단위 | - | Quiz + Numeric | sim2d | verified |
| acceleration | 등가속도 운동 | measurement | Numeric | sim2d | verified |
| projectile | 포물선 운동 | acceleration | Numeric + Challenge | sim2d | verified |
| newton | 뉴턴의 법칙 | acceleration | Numeric + Quiz | sim2d | verified |
| circular | 원운동 | newton | Numeric | sim2d | verified |
| energy | 역학적 에너지 | newton | Numeric | sim2d | verified |
| waves | 파동 | measurement | Quiz + Numeric | sim2d | verified |
| mock-exam | 모의고사 | all | exam SlideDeck | exam | verified |
