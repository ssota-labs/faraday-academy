# 스타 차트 — overview

## Brief

- **Audience:** 일반 성인 + 대학 갓 입학한 학습자 (curious adult / early undergrad)
- **Methodology:** Mayer multimedia principles (segmented, coherent, conversational) + Peer Instruction-style ConcepTests before key interactives
- **Goal:** 중력·시간·빛이 어떻게 엮이는지 만져보며 예측할 수 있다
- **Scope:** LinearCourse 6챕터 + `three` (Scene3D mood=`space`) + `sim2d`
- **Constraint:** 영화 제목·대사·포스터 금지 — 물리 개념 이름만

## Packs kept

- `three` — 궤도·슬링샷·렌즈 등 공간 개념
- `sim2d` — SVG 시뮬 루프
- `audience`, `lecture-design` — skill only
- Removed: tutor, game2d, storybook-game2d, srs, notes, exam, slide-view, textbook-view

## Sequence (linear TOC)

| id | title | requires | check | packs | status |
|----|-------|----------|-------|-------|--------|
| kepler | 케플러 궤도 | — | Quiz + NumericAnswer | three, chart | verified |
| slingshot | 중력 슬링샷 | kepler | Quiz | sim2d | verified |
| elevator | 등가원리 엘리베이터 | slingshot | Quiz | sim2d | verified |
| dilation | 중력 시간지연 | elevator | Quiz + NumericAnswer | chart | verified |
| lensing | 빛 휨과 중력 렌즈 | dilation | Quiz | three, chart | verified |
| clocks | 시계 맞추기 | lensing | Challenge + Quiz | sim2d | verified |
