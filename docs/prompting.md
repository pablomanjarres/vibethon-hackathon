# Prompt log: <product name>

Copy to `docs/prompting.md` in the first hour and keep it current. Real prompts and real failures only; never write one after the fact that did not happen. Write it in the challenge's language.

## 1. The prompt you were given

Paste it as sent, even when it is one line.

```text
<the prompt as sent>
```

## 2. The build prompt (the spec that drives the work)

Before any code, turn the challenge pack into the prompt the build follows, and follow it. Judges score this text: a generic one-liner loses points, a labelled spec gets them. Every field filled, in the challenge's words:

> **Problema:** who has the problem and what goes wrong today.
> **Usuario:** the person who benefits, and where and how they use it.
> **Objetivo:** what they can do with the product that they cannot do today.
> **Requisitos obligatorios:** every one from the challenge, numbered as in the challenge.
> **Restricciones:** the challenge's conditions (limits, data, language, devices, deliverables).
> **Decisiones:** the three to five decisions that follow from the above, each with its reason.
> **Verificación:** how each requirement will be checked (sweep, click-through, screenshot).

## 3. Corrections (three or more)

One entry per failure you saw. A failure is something observed: the sweep, a screenshot, a click-through or a judge question showed it. At least one must be a behavior or rule mistake (a wrong limit, a wrong order, a lost input), not only layout. Paste the check's real output (the sweep or click-through lines), not just "passed".

### Correction 1

| Step | Content |
|---|---|
| Observed failure | What happened, where, how it was noticed (sweep output, screenshot, console error) |
| Cause | Why the prompt let it happen (missing requirement, vague wording, no check asked for) |
| Corrected prompt | The instruction you gave to fix it, quoted as a prompt ("Las tres pestañas deben caber a 390 px...") |
| Check after the fix | The command, click path or screenshot that proves it is fixed, run on the built site, and its result. Claim only what that check saw |

## 4. How we know the result meets the challenge

| Requirement or rubric item | Checked how | Result |
|---|---|---|
| | | |
