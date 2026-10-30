# Demo script: <product name>

Copy to `docs/demo-script.md`. One path, 90 seconds, from the hero screen to the receipt, then one failure and its recovery. Rehearse it three times on the deployed URL.

## 1. The path

| Time | Click or key | Screen shows | Say (one sentence) | If it breaks |
|---|---|---|---|---|
| 0:00 | Open the deployed URL on the hero route | | Who it is for and the one task | Reload the deep link |
| 0:20 | Click Overdue in the filter bar | URL gains `urgency=overdue`; only overdue requests remain | "These are past their legal deadline; a refresh keeps this view." | Open the saved deep link |
| | | | | |
| | | | | |
| | | | | |
| 1:00 | DemoBar, choose Rejected, repeat the action | Input kept, reason shown, Try again | "When the service refuses, nothing typed is lost." | Open `?demo=fail` directly |
| | | | | |
| 1:30 | End on the receipt or the phone view | | What was tested, what is next | |

## 2. Before going on stage

- [ ] Deployed URL opens with no login or key; deep links work.
- [ ] Sample data labeled on screen.
- [ ] Demo state back to Normal; seeded data fresh (reload or Reset demo data).
- [ ] Browser zoom 100 %, notifications off, other tabs closed.
- [ ] Phone ready on the same URL for the phone beat.
- [ ] Fallback: the recorded walkthrough (60 to 120 s, captions, title and end card with the URL).

## 3. Honest claims

| Say | Not |
|---|---|
| What was built, and which parts are stubbed | That stubbed parts are live |
| "Handles stale versions and double clicks in testing" | Effects never measured ("saves ten hours a week") |
| Illustrative numbers labeled as samples | Invented testimonials, customer logos, credentials or results |
