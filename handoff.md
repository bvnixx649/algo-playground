# Handoff

Snapshot as of **2026-10-11** (a point-in-time record, not a running log). Rules: [AGENTS.md](AGENTS.md) ·
background: [projectsummary.md](projectsummary.md) · decisions: [memory.md](memory.md).

## Status: green
A full audit was run and **all 12 findings were fixed**, then two source documents were turned into
pages: the old exam paper (`#exam`) and the P/NP worksheet (`#np`). Nothing is known broken.

```
node test.js   →  all 10083 checks passed
```
Browser: all 16 lessons, 3 practice drills, the exam page and the `#np` page driven (every stepper
frame, every button, every input set to `''`, `0`, `999`, `abc`, `-5`, all 25 exam answers, all 15
`#np` answers) → **0 console errors**; correct runs reach 25/25 and 15/15.

**Nothing here blocks work, and nothing is approved on the author's behalf.**

## What changed in that session
Trim this section to one line once the work is merged — the current files are the record, not this table.

| Area | Change |
|---|---|
| `app.js` | autoplay clock stops itself when its figure is replaced; removed the unused `Lab.stepper` return API + `opts.onStep`, the dead `reset` icon/branch, the always-empty `kk`/`.kick` label, and the unused `wOff`/`extraH` options; added `Lab.r2`; `#exam` and `#np` routes + home-page links (page modules named `Lab.examPage` / `Lab.npPage` because `Lab.exam` is the lessons' helper). |
| `index.html` | added `<!doctype html>` + `<html lang="th">` + `<head>`/`<body>` (was quirks mode); merged the duplicated `:root` theme variables; collapsed `.stage` from 3 rules to 1; deleted the `.kick` rules; `<script>` tags for `exam.js` and `np.js`; two new rules (`table.dt td.t`, `.check input.ans.free`). |
| `lesson-horspool.js` | exports `Lab.shiftTable`; uses `Lab.gap`. |
| `lesson-boyer.js` | uses `Lab.shiftTable` instead of its own copy. |
| `lesson-knapsack.js` | exports `Lab.core.knapsack.solve`. |
| `lesson-obst.js`, `lesson-huffman.js` | use `Lab.r2`. |
| `lesson-dijkstra.js` | uses `Lab.fmt` / `Lab.gap`; exports `Lab.core.dijkstra`. |
| `practice.js` | uses `Lab.shiftTable` and `Lab.core.knapsack.solve`; dropped its two local copies. |
| every `lesson-*.js` | one line exporting its pure solver on `Lab.core` (for the tests). |
| `test.js` | **new** — brute-force checks for every solver, the five computed exam keys, and every computed `#np` answer. |
| `exam.js` | **new** — `#exam`: 25 questions from `source/ex.md`, 20 multiple choice + 5 check-as-you-type, score, reset, "ดูวิธีทำ" folds. |
| `np.js` | **new** — `#np`: the P/NP/NP-Complete worksheet filled in (definitions + Venn, 8 exercise sections, 14-problem summary table) + a 15-question self-test with score and reset. |
| 2nd audit pass | dead `Lab.stepper` leftovers removed; `Lab.answerInput` + `Lab.scoreboard` added (practice/exam/np now share both); `exam.js` no longer reads `Lab.core.coinrow` at load, and `test.js` loads the page modules before the lessons as a guard; the exam normalisers are now tested for the loose formats they promise; `N.num` accepts a decimal comma; `theme-color` matches the light background; a duplicate `facts` field dropped. |
| docs | `AGENTS.md`, `projectsummary.md`, `memory.md`, `handoff.md`, `README.md`, `CLAUDE.md` (pointer). |

## Verification evidence
- Algorithms against brute force: search (Horspool/Boyer-Moore), all subsets (coin-row, knapsack),
  BFS (change-making), every tree shape (optimal BST), best of all trees (Huffman), Bellman-Ford
  (Dijkstra), every spanning subset (Prim/Kruskal), B-tree invariants, both counting sorts, every
  monotone path (coin-collecting), hashing occupancy.
- Exam keys: the 5 computed answers (Q3 coin-row, Q4 Dijkstra, Q17 shift table, Q19 Huffman,
  Q25 Floyd) are asserted against the lesson solvers in `test.js`.
- `#np`: every computed answer (SAT assignments, clique / independent set / vertex cover, subset-sum
  results, chromatic number, the 2-approximation simulation, the nearest-neighbour TSP tour) is
  recomputed by brute force in `test.js`, plus a structural check on the 15 self-test questions.
- Timer fix measured in the browser: play → rebuild → interval cleared within one tick.
- CSS: one `.stage` rule, zero `.kick` rules, `document.compatMode === 'CSS1Compat'`, `lang="th"`,
  light/dark theme values identical to before the merge.
- Caught by the browser sweep, not by tests: naming the new page `Lab.exam` overwrote the lessons'
  `Lab.exam(...)` helper and broke 12 lessons. Renamed to `Lab.examPage`; `AGENTS.md` rule 3 warns.
- 2nd audit pass: all 22 routes swept again → 0 console errors; a full correct `#practice/horspool`
  drill (4 runs) and `#practice/knapsack` drill (3 runs) still finish with no counted mistakes, so the
  refactored answer wiring behaves the same; the exam's decimal comma locks the answer; its "ตรวจ"
  button shows "ยังไม่ตรง"; both score lines count and reset to 0.

## Reference: if you add a lesson
1. New `lesson-<id>.js` with pure solver(s) at module scope and `Lab.register({...})`.
2. Add the `<script>` tag in `index.html` **after** anything it reads and before `practice.js`.
3. `checks` must match the number of `Lab.check` calls.
4. Export the solver on `Lab.core.<id>` and add a check in `test.js`.
5. Walk the page in a browser (frames + odd inputs) and re-run `node test.js`.

## Reference: if you add a page (like `#exam` / `#np`)
1. New `page.js` exporting a **fresh** `Lab.<something>Page = { render }` (never reuse a `Lab.*` name)
   and `Lab.core.<something>` for anything `test.js` should verify.
2. Add the `<script>` tag in `index.html` after its dependencies (after `np.js` is fine), a branch in
   `app.js`'s `route()` and a home-page link.
3. Reuse `Lab.topbar` / `Lab.beat` / `Lab.check` / `table.dt` — do not add CSS unless a class is
   genuinely missing.

## Working tree
- **Git:** one branch `main`, tracking `origin/main` (https://github.com/bvnixx649/algo-playground).
  **Everything below is uncommitted** — `git status` shows 19 modified files plus 9 untracked
  (`AGENTS.md`, `CLAUDE.md`, `exam.js`, `handoff.md`, `memory.md`, `np.js`, `projectsummary.md`,
  `source/`, `test.js`). Nothing was committed or pushed in this session.
- 29 files at the repo root + `source/` (2 raw inputs). No stray dev server or temp file left behind.
- `node test.js` was last run after the final edit and passed.

## Next up / Open items
0. **The 2nd audit's six findings and two small items are all fixed** — see the change table above.
1. **Decision-free now — no answer needed unless you disagree:**
   - README no longer claims a week range; each lesson cites its own deck and page numbers.
   - `#exam` shows both the corrected key and the original paper's wrong key inside "ดูวิธีทำ", and the
     hero says the keys were re-verified. If the paper's key must be reproduced verbatim, one line reverses it.
   - `#np` §2.1 now gives the flat จริง/เท็จ convention (ข้อ 2 = เท็จ, ข้อ 8 = เท็จ under P ≠ NP) as a
     footnote alongside the "ยังไม่ทราบ" answers, so either convention the course uses is covered.
2. **Decided not to do (recorded, not pending):** merging the "editorial pass" CSS layer. 36 selectors
   are declared twice on purpose; equal specificity makes a merge order-sensitive and it is
   cosmetic-only. The block now says so in a comment, and `AGENTS.md` rule 8 forbids the bulk version.
3. **Not tested — needs hardware or accounts:** real touch devices, a screen reader, and the deployed
   GitHub Pages copy (only the local server was used). The light theme was eyeballed in the browser.
4. **Context-engineering items deliberately skipped:** no separate project-map file (the Layout +
   Patterns tables in `AGENTS.md` are the map), no per-feature spec split (the docs are already
   sectioned and ~750 lines total), no MCP server (nothing here needs a DB/CI integration).

## How to resume
```powershell
cd D:\Project\Algo\algo-playground
node test.js                 # must print: all 10083 checks passed
python .serve.py             # then open http://127.0.0.1:5178
```
