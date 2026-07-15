# mock

- **outcome:** Complete a short blueprint-driven mini mock covering prior nodes; review by outcome.
- **interaction:** SlideDeck exam (exam pack pattern) — mix Quiz + NumericAnswer items mapped to units/uam/projectile/newton/energy/waves. Final Reveal review.
- **check:** Last slide or a final Quiz/Numeric that calls complete() when learner finishes review path — e.g. a metacognitive Quiz “ready to finish” after Reveal, or complete on answering ≥N items correctly (keep simple: one cumulative Numeric/Quiz at end with onCorrect={complete}).
- **file:** `src/lesson/nodes/mock.tsx`
- **status:** todo
- **requires:** waves
- **blueprint:** measurement 1 · kinematics 1 · forces 1 · energy/waves 1 (4 items + intro + review)
- **API note:** Real kit Quiz uses `question` + `options[{label,correct?,hint?}]` — NOT prompt/answer index. NumericAnswer uses `question`/`answer`/`tolerance`/`unit`/`hint`/`onCorrect`. SlideDeck uses `slides` prop.
- **quality:** Follow exam pack skill spirit; InstallCta at end.
