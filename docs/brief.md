# Brief: <product name>

Copy to `docs/brief.md`. Ten minutes. Fill every slot; leave nothing implied. If the primary task does not fit in one sentence, the family is not chosen yet.

| Slot | Content |
|---|---|
| Family | Primary family, plus at most one secondary view |
| Audience | Who uses it and why now |
| Primary task | The one thing they must complete, in one sentence |
| Goal | Why that task matters to the judges' problem statement |
| Evidence | What the brief or data actually says; what is assumed (label each) |
| First phase | The hero screen and the one complete journey to build |
| Constraints | Time, data access, APIs, team skills |
| Acceptance | Observable tests that say "done" (see qa-matrix.md and the acceptance list below) |
| Exclusions | What is deliberately not built this weekend |
| Benefit example | One concrete case, before and after, with numbers from the seeded data ("María found the 3 overdue refills in 10 s instead of calling 3 pharmacies"). Time the main task in the click-through and quote that measured number |
| People test | Before the demo, the team asks one or two people outside the team to do the main task without help: time, where they hesitated, what changed. Never filled in by anyone who did not run it |
| Challenge conditions | The scenario's limits the solution respects (who, where, time, data, budget, language) |

## Challenge pack

Read every document the challenge gave (reto, bases, rubric, judges or strategy PDF, scoring-table photo) before filling this page. List them here with what each one says that changes the build.

| Document | What it changes |
|---|---|
| | |

### Rubric (copy every category and item; weights or points as written)

Skip teamwork: judges score it from the team, not the build, so it gets no row here and no evidence anywhere.

| Category | Weight | Item | Evidence (route, control or doc) | Done |
|---|---|---|---|---|
| | | | | [ ] |

### Judges

| Judge | What they look for | Their question | Where the demo answers it |
|---|---|---|---|
| | | | |

## Mandatory requirements (copy from the challenge text, word for word)

One checkbox per requirement or judging criterion. Each one names the screen or control that proves it. Tick it only after doing it in the running demo.

| # | Requirement (as written in the challenge) | Where the demo shows it | Done |
|---|---|---|---|
| 1 | Cumple los requisitos obligatorios del reto | | [ ] |
| 2 | Permite completar el flujo principal | | [ ] |
| 3 | Los controles realizan las acciones que anuncian | | [ ] |
| 4 | La demostración termina sin errores que bloqueen su uso | | [ ] |

Filled example line (operational workspace):

> Primary task: a city hall case officer opens the oldest overdue citizen request and accepts, returns or transfers it before its legal deadline in business days.

## Acceptance (keep, edit numbers only if the event demands it)

- [ ] Demo journey completes from the hero screen to the receipt on seeded data.
- [ ] A forced failure (`?demo=fail`) keeps entered data and offers retry; success only after confirmation.
- [ ] No horizontal overflow at 360 px; usable on one real phone.
- [ ] Every task control reachable by keyboard; focus visible and returned after dialogs.
- [ ] Hero route on the deployed build, mobile profile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, conditions recorded.
- [ ] Sample data labeled on screen; built vs stubbed parts written down.
