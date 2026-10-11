/* Checks every lesson solver against a brute-force answer. No dependencies.
   Run:  node test.js
   Each lesson exposes its pure core on Lab.core, so this tests the real code,
   not a copy. The exam answers are hand-written text, so this is what keeps
   them in step with the DP/search code that draws the picture. */
const assert = require('assert');

globalThis.window = globalThis; // app.js sets window.Lab
require('./app.js');
// Page modules first, on purpose: they must not read another lesson's core at load time
// (regression guard for the script-order hazard — see handoff.md).
require('./exam.js');
require('./np.js');
for (const n of ['counting', 'horspool', 'boyer', 'hashing', 'btree', 'coinrow', 'change',
  'collect', 'knapsack', 'obst', 'floyd', 'prim', 'kruskal', 'dijkstra', 'huffman'])
  require('./lesson-' + n + '.js');
require('./practice.js');

const C = Lab.core;
let runs = 0, bad = 0;
const check = (cond, msg) => { runs++; if (!cond) { bad++; console.error('FAIL: ' + msg); } };

/* seeded RNG so any failure can be reproduced */
let seed = 20260101;
const rnd = (n) => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n);

/* ---------- Horspool and Boyer-Moore vs a plain search ---------- */
function bruteFind(t, p) {
  for (let s = 0; s + p.length <= t.length; s++) { let k = 0; while (k < p.length && t[s + k] === p[k]) k++; if (k === p.length) return s; }
  return -1;
}
for (let it = 0; it < 3000; it++) {
  const text = Array.from({ length: 2 + rnd(9) }, () => 'AB'[rnd(2)]).join('');
  const pat = Array.from({ length: 1 + rnd(Math.min(4, text.length)) }, () => 'AB'[rnd(2)]).join('');
  const want = bruteFind(text, pat);
  const hf = C.horspool.frames(text, pat).find((f) => f.found);
  check(want < 0 ? !hf : hf && hf.start === want, 'horspool ' + text + ' / ' + pat);
  const bf = C.boyer.frames(text, pat).find((f) => f.found);
  check(want < 0 ? !bf : bf && bf.start === want, 'boyer ' + text + ' / ' + pat);
}

/* ---------- coin-row vs all no-two-adjacent subsets ---------- */
function bruteCoinrow(c) {
  let best = 0;
  for (let m = 0; m < (1 << c.length); m++) {
    let ok = true, v = 0;
    for (let i = 0; i < c.length; i++) if (m & (1 << i)) { if (i && (m & (1 << (i - 1)))) { ok = false; break; } v += c[i]; }
    if (ok && v > best) best = v;
  }
  return best;
}
for (let it = 0; it < 400; it++) {
  const c = Array.from({ length: 1 + rnd(10) }, () => rnd(20));
  const { F, pick } = C.coinrow.solve(c);
  check(F[c.length] === bruteCoinrow(c), 'coinrow ' + c);
  check(pick.reduce((s, i) => s + c[i - 1], 0) === F[c.length], 'coinrow pick ' + c);
}

/* ---------- change-making vs breadth-first over amounts ---------- */
function bfsChange(D, n) {
  let frontier = [0], depth = 0;
  const seen = new Set([0]);
  while (frontier.length) {
    const next = [];
    for (const a of frontier) {
      if (a === n) return depth;
      for (const d of D) if (a + d <= n && !seen.has(a + d)) { seen.add(a + d); next.push(a + d); }
    }
    frontier = next; depth++;
  }
  return Infinity;
}
for (let it = 0; it < 400; it++) {
  const n = 1 + rnd(40);
  const D = [...new Set([1, ...Array.from({ length: 4 }, () => 1 + rnd(12))])].sort((a, b) => a - b);
  check(C.change.solve(D, n).F[n] === bfsChange(D, n), 'change ' + D + ' n=' + n);
}

/* ---------- 0/1 knapsack vs all subsets ---------- */
function bruteKnap(items, W) {
  let best = 0;
  for (let m = 0; m < (1 << items.length); m++) {
    let w = 0, v = 0;
    for (let i = 0; i < items.length; i++) if (m & (1 << i)) { w += items[i].w; v += items[i].v; }
    if (w <= W && v > best) best = v;
  }
  return best;
}
for (let it = 0; it < 400; it++) {
  const n = 1 + rnd(8), W = 1 + rnd(12);
  const items = Array.from({ length: n }, () => ({ w: 1 + rnd(6), v: 1 + rnd(30) }));
  const { F, pick } = C.knapsack.solve(items, W);
  check(F[n][W] === bruteKnap(items, W), 'knapsack ' + JSON.stringify(items) + ' W=' + W);
  check(pick.reduce((s, i) => s + items[i - 1].v, 0) === F[n][W], 'knapsack pick');
}

/* ---------- optimal BST vs every tree shape (sum of depth x probability) ---------- */
function bruteObst(p) {
  const n = p.length;
  const rooted = (i, j, depth) => {
    if (i > j) return [0];
    const out = [];
    for (let k = i; k <= j; k++) {
      const base = p[k - 1] * depth;
      for (const L of rooted(i, k - 1, depth + 1)) for (const R of rooted(k + 1, j, depth + 1)) out.push(base + L + R);
    }
    return out;
  };
  return Math.min(...rooted(1, n, 1));
}
for (let it = 0; it < 200; it++) {
  const n = 1 + rnd(4);
  const p = Array.from({ length: n }, () => (1 + rnd(90)) / 100);
  check(Math.abs(C.obst.solve(p).C[1][n] - bruteObst(p)) < 1e-9, 'obst ' + p);
}

/* ---------- Huffman vs the best of all full binary trees ---------- */
function bruteHuff(fq) {
  const w = fq.map(([, f]) => f);
  const costs = (list) => {
    if (list.length === 1) return [0];
    const out = [];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const rest = list.filter((_, k) => k !== i && k !== j);
      for (const c of costs([...rest, list[i] + list[j]])) out.push(list[i] + list[j] + c);
    }
    return out;
  };
  return Math.min(...costs(w)) / w.reduce((a, b) => a + b, 0);
}
for (let it = 0; it < 100; it++) {
  const n = 2 + rnd(4);
  const fq = Array.from({ length: n }, (_, i) => [String.fromCharCode(65 + i), 1 + rnd(20)]);
  const { codes } = C.huffman.build(fq);
  const tot = fq.reduce((a, [, f]) => a + f, 0);
  const avg = fq.reduce((a, [s, f]) => a + codes[s].length * f, 0) / tot;
  const cs = Object.values(codes);
  check(Object.keys(codes).length === n, 'huffman has every letter ' + JSON.stringify(fq));
  check(Math.abs(avg - bruteHuff(fq)) < 1e-9, 'huffman optimal ' + JSON.stringify(fq));
  check(cs.every((a) => cs.every((b) => a === b || !b.startsWith(a))), 'huffman prefix-free');
}

/* ---------- Dijkstra vs Bellman-Ford ---------- */
function bellman(V, E, s) {
  const d = Object.fromEntries(V.map((v) => [v, Infinity])); d[s] = 0;
  for (let it = 0; it < V.length - 1; it++) for (const [u, v, w] of E) if (d[u] + w < d[v]) d[v] = d[u] + w;
  return d;
}
for (let it = 0; it < 200; it++) {
  const V = ['a', 'b', 'c', 'd', 'e'];
  const E = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) if (rnd(100) < 60) E.push([V[i], V[j], 1 + rnd(9)]);
  const G = { pos: Object.fromEntries(V.map((v) => [v, [0, 0]])), E };
  const s = V[rnd(V.length)];
  const fin = C.dijkstra.run(G, s).pop();
  const want = bellman(V, E.flatMap(([u, v, w]) => [[u, v, w], [v, u, w]]), s);
  check(V.every((v) => fin.dist[v] === want[v]), 'dijkstra ' + JSON.stringify(E) + ' s=' + s);
}

/* ---------- Warshall reachability and Floyd optimality (slides' graphs) ---------- */
{
  const V4 = ['a', 'b', 'c', 'd'];
  const reach = { a: 'abcd', b: 'abcd', c: '', d: 'abcd' };
  const RW = C.floyd.frames(true).pop().M;
  check(V4.every((u, iu) => V4.every((v, iv) => !!RW[iu][iv] === reach[u].includes(v))), 'warshall reachability');

  const M = C.floyd.frames(false).pop().M;
  const nx = ['a', 'b', 'c', 'd'].indexOf.bind(['a', 'b', 'c', 'd']);
  check(M.every((r, i) => r[i] === 0), 'floyd diagonal is 0');
  let stable = true;
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) if (M[i][k] + M[k][j] < M[i][j]) stable = false;
  check(stable, 'floyd found every shortest path');
  check(M[nx('a')][nx('c')] === 3 && M[nx('a')][nx('d')] === 4 && M[nx('b')][nx('c')] === 5, 'floyd slide answers');
}

/* ---------- Prim and Kruskal vs brute-force MST over all spanning subsets ---------- */
{
  const G = Lab.MSTG, V = Object.keys(G.pos), E = G.E;
  let bestM = Infinity;
  for (let m = 0; m < (1 << E.length); m++) {
    const pick = E.filter((_, i) => m & (1 << i));
    if (pick.length !== V.length - 1) continue;
    const f = Object.fromEntries(V.map((v) => [v, v]));
    const find = (x) => { while (f[x] !== x) x = f[x]; return x; };
    let w = 0, ok = true;
    for (const [u, v, wt] of pick) {
      const a = find(u), b = find(v);
      if (a === b) { ok = false; break; }
      f[a] = b; w += wt;
    }
    if (ok && w < bestM) bestM = w;
  }
  check(C.prim.frames(G, 'a').pop().total === bestM, 'prim MST weight');
  check(C.prim.frames(G, 'd').pop().total === bestM, 'prim same MST from another start');
  check(C.kruskal.frames(G).pop().total === bestM, 'kruskal MST weight');
}

/* ---------- B-tree keeps every key, stays balanced and ordered ---------- */
{
  const seedKeys = [4, 7, 10, 11, 14, 15, 16, 19, 20, 24, 25, 28, 34, 38, 40, 43, 46, 51, 55, 60, 68, 80];
  const leavesOf = (n, out) => { if (n.leaf) out.push(n.keys); else n.kids.forEach((k) => leavesOf(k, out)); };
  for (let it = 0; it < 50; it++) {
    let root = C.btree.initial();
    const added = [];
    for (let t = 0; t < 12; t++) { const k = 1 + rnd(90); added.push(k); root = C.btree.insert(root, k).root; }
    const depths = [];
    (function walk(n, d) { if (n.leaf) { depths.push(d); return; } n.kids.forEach((k) => walk(k, d + 1)); })(root, 0);
    const leaves = []; leavesOf(root, leaves);
    const got = [...leaves.flat()].sort((a, b) => a - b);
    const want = [...new Set(seedKeys.concat(added))].sort((a, b) => a - b);
    check(new Set(depths).size === 1, 'btree all leaves at one depth');
    check(JSON.stringify(got) === JSON.stringify(want), 'btree kept every key');
    check(leaves.every((l) => l.length >= 1 && l.length <= 3), 'btree leaf size 1..3');
    check(leaves.every((l) => l.every((x, i) => i === 0 || l[i - 1] < x)), 'btree keys sorted in a leaf');
    check((function shape(n) { return n.leaf || (n.kids.length === n.keys.length + 1 && n.kids.every(shape)); })(root), 'btree node shape');
  }
}

/* ---------- comparison counting and distribution counting ---------- */
for (let it = 0; it < 200; it++) {
  const A = Array.from({ length: 2 + rnd(6) }, () => rnd(9));
  const want = [...A].sort((a, b) => a - b);
  check(JSON.stringify(C.counting.cmpFrames(A).pop().S) === JSON.stringify(want), 'comparison counting ' + A);
  check(JSON.stringify(C.counting.distFrames(A).pop().S) === JSON.stringify(want), 'distribution counting ' + A);
}

/* ---------- coin-collecting vs every monotone path ---------- */
function bruteCollect(g) {
  const n = g.length, m = g[0].length;
  return (function walk(i, j) {
    if (i === n - 1 && j === m - 1) return g[i][j];
    let best = -Infinity;
    if (i + 1 < n) best = Math.max(best, walk(i + 1, j));
    if (j + 1 < m) best = Math.max(best, walk(i, j + 1));
    return best + g[i][j];
  })(0, 0);
}
for (let it = 0; it < 200; it++) {
  const n = 1 + rnd(6), m = 1 + rnd(6);
  const g = Array.from({ length: n }, () => Array.from({ length: m }, () => (rnd(100) < 40 ? 1 : 0)));
  const { F, path } = C.collect.solve(g);
  check(F[n - 1][m - 1] === bruteCollect(g), 'coin-collecting value');
  check(path.reduce((s, [i, j]) => s + g[i][j], 0) === F[n - 1][m - 1], 'coin-collecting path value');
  check(path.length === n + m - 1, 'coin-collecting path length');
}

/* ---------- hashing keeps every word once ---------- */
{
  const words = ['A', 'FOOL', 'AND', 'HIS', 'MONEY', 'ARE', 'SOON', 'PARTED'];
  const open = C.hashing.frames(words, 'open').pop().T.flat();
  check(open.length === words.length && new Set(open).size === words.length, 'open hashing stores every word once');
  const stored = C.hashing.frames(words, 'closed').pop().T.filter((x) => x !== null);
  check(stored.length === words.length && new Set(stored).size === words.length, 'closed hashing stores every word once');
}

/* ---------- exam keys must match the solvers (the answers are text; this ties them to code) ---------- */
{
  const { questions, norm: N } = Lab.core.exam;
  const nrm = (Q, x) => (Q.mode ? N[Q.mode](x) : N.num(x));
  check(questions.length === 25, 'exam has 25 questions');
  const seen = new Set();
  for (const Q of questions) {
    check(!seen.has(Q.n) && Q.n >= 1 && Q.n <= 25, 'exam question numbering ' + Q.n);
    seen.add(Q.n);
    if (Q.o) {
      check(Number.isInteger(Q.a) && Q.a >= 0 && Q.a < Q.o.length, 'exam Q' + Q.n + ' answer is a valid option');
      check(new Set(Q.o).size === Q.o.length, 'exam Q' + Q.n + ' options are distinct');
    } else {
      check(nrm(Q, Q.ans) === nrm(Q, Q.show) && nrm(Q, Q.ans) !== '', 'exam Q' + Q.n + ' key parses and matches what is shown');
    }
  }
  const byN = (n) => questions.find((q) => q.n === n);
  const coins = [3, 15, 2, 1, 3, 12, 19, 4, 7, 25, 6, 11, 18, 5, 9, 21, 14, 8, 2, 10];
  check(nrm(byN(3), byN(3).ans) === nrm(byN(3), Lab.core.coinrow.solve(coins).F[coins.length]), 'exam Q3 key = coin-row solver');
  check(nrm(byN(19), byN(19).ans) === nrm(byN(19), Lab.core.huffman.build([['A', 51], ['B', 25], ['C', 14], ['D', 10]]).avg), 'exam Q19 key = Huffman solver');
  const table = Object.entries(Lab.shiftTable('bacedbcdeeda')).map(([c, v]) => c + ':' + v).join(' ') + ' *:12';
  check(nrm(byN(17), byN(17).ans) === nrm(byN(17), table), 'exam Q17 key = Horspool shift table');
  const G4 = { pos: { A: [0, 0], B: [0, 0], C: [0, 0], D: [0, 0], E: [0, 0] },
    E: [['A', 'B', 5], ['A', 'C', 1], ['C', 'B', 1], ['B', 'D', 3], ['C', 'D', 8], ['C', 'E', 1], ['E', 'B', 2], ['E', 'D', 2]] };
  const fin = Lab.core.dijkstra.run(G4, 'A').pop();
  const paths = ['B', 'C', 'D', 'E'].map((v) => {
    const p = [v];
    while (p[0] !== 'A' && fin.prev[p[0]]) p.unshift(fin.prev[p[0]]);
    return p.join('->') + ':' + fin.dist[v];
  }).join(' ');
  check(nrm(byN(4), byN(4).ans) === nrm(byN(4), paths), 'exam Q4 key = Dijkstra solver');
  const D0 = [[0, 3, 0, 7], [8, 0, 2, 0], [5, 0, 0, 1], [2, 0, 0, 0]];
  const M = D0.map((r) => r.map((x) => (x === 0 ? Infinity : x)));
  for (let i = 0; i < 4; i++) M[i][i] = 0;
  for (let k = 0; k < 4; k++) for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (M[i][k] + M[k][j] < M[i][j]) M[i][j] = M[i][k] + M[k][j];
  check(nrm(byN(25), byN(25).ans) === nrm(byN(25), '[' + M.map((r) => '[' + r.join(' ') + ']').join(' ') + ']'), 'exam Q25 key = Floyd solver');
  // the normalisers must accept the loose formats the page tells students they may use
  const loose = [
    [byN(4), 'a->c->e:2  a->c:1  A->C->B:2  A->C->E->D:4', 'route order and case'],
    [byN(17), 'D:1, E:2, *:12, C:5, B:6, A:10', 'commas and order'],
    [byN(19), ' 1.73 ', 'spaces'],
    [byN(19), '1,73', 'a decimal comma'],
    [byN(25), '0 3 5 6 / 5 0 2 3 / 3 6 0 1 / 2 5 7 0', 'a loose matrix layout'],
  ];
  for (const [Q, typed, what] of loose) check(nrm(Q, typed) === nrm(Q, Q.ans), 'exam Q' + Q.n + ' accepts ' + what);
}

/* ---------- worksheet (np page): every computed answer vs brute force ---------- */
{
  require('./np.js');
  const { facts, questions } = Lab.core.np;
  check(questions.length === 15, 'np page has 15 self-test questions');
  for (const Q of questions) {
    check(Number.isInteger(Q.a) && Q.a >= 0 && Q.a < Q.o.length, 'np Q' + Q.n + ' answer is a valid option');
    check(new Set(Q.o).size === Q.o.length, 'np Q' + Q.n + ' options are distinct');
  }
  const satAll = (clauses) => {
    const out = [];
    for (let m = 0; m < 8; m++) {
      const e = { 1: !!(m & 1), 2: !!(m & 2), 3: !!(m & 4) };
      if (clauses.every((cl) => cl.some((l) => (l > 0 ? e[l] : !e[-l])))) out.push(['x₁=' + (e[1] ? 'T' : 'F'), 'x₂=' + (e[2] ? 'T' : 'F'), 'x₃=' + (e[3] ? 'T' : 'F')].join(', '));
    }
    return out;
  };
  const s1 = satAll([[1, 2], [-1, 3], [-2, -3], [1, -2, 3]]);
  check(s1.length === 1 && s1[0] === facts.sat.phi1, 'np φ₁ unique assignment');
  check(satAll([[1], [-1, 2], [-2, 3], [-1, -3]]).length === 0 && facts.sat.phi2 === false, 'np φ₂ unsatisfiable');
  check(satAll([[1, 2], [-1, -2], [1, -2], [-1, 2]]).length === 0 && facts.sat.phi3 === false, 'np φ₃ unsatisfiable');

  const GV = [1, 2, 3, 4, 5], GE = [[1, 2], [1, 4], [1, 5], [2, 3], [2, 5], [3, 5], [4, 5]];
  const hasE = (u, v) => GE.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
  const subs = (arr) => { const o = []; for (let m = 1; m < (1 << arr.length); m++) o.push(arr.filter((_, i) => m & (1 << i))); return o; };
  const cliq = subs(GV).filter((s) => s.every((u) => s.every((v) => u === v || hasE(u, v))));
  const indep = subs(GV).filter((s) => s.every((u) => s.every((v) => u === v || !hasE(u, v))));
  const cover = subs(GV).filter((s) => GE.every(([a, b]) => s.includes(a) || s.includes(b)));
  check(Math.max(...cliq.map((s) => s.length)) === facts.graph.clique, 'np max clique = 3');
  check(Math.max(...indep.map((s) => s.length)) === facts.graph.mis, 'np max independent set = 2');
  check(Math.min(...cover.map((s) => s.length)) === facts.graph.minVC, 'np min vertex cover = 3');

  const subsum = (S, t) => { const r = []; for (let m = 0; m < (1 << S.length); m++) { let s = 0, p = []; for (let i = 0; i < S.length; i++) if (m & (1 << i)) { s += S[i]; p.push(S[i]); } if (s === t) r.push(p.join('+')); } return r; };
  check(JSON.stringify(subsum([2, 5, 7, 10, 14], 19).sort()) === JSON.stringify(facts.subsetSum.a.slice().sort()), 'np subset sum a = 2+7+10, 5+14');
  check(subsum([1, 3, 5, 8, 13], 20).length === 0 && facts.subsetSum.b.length === 0, 'np subset sum b = none');
  check(subsum([2, 4, 6, 8], 11).length === 0 && facts.subsetSum.c.length === 0, 'np subset sum c = none');

  const CV = ['A', 'B', 'C', 'D', 'E'], CE = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E']];
  const colorable = (k) => { const col = {}; return (function bt(i) { if (i === CV.length) return true; for (let c = 0; c < k; c++) { if (CE.every(([u, v]) => !((u === CV[i] && col[v] === c) || (v === CV[i] && col[u] === c)))) { col[CV[i]] = c; if (bt(i + 1)) return true; delete col[CV[i]]; } } return false; })(0); };
  check(colorable(1) === false && colorable(2) === true && facts.chromatic === 2, 'np chromatic number = 2');

  const AE = [[1, 2], [2, 3], [1, 4], [3, 6], [4, 5], [5, 6]];
  let EE = AE.slice(); const C = new Set();
  while (EE.length) { const [u, v] = EE[0]; C.add(u); C.add(v); EE = EE.filter(([a, b]) => a !== u && b !== u && a !== v && b !== v); }
  let optVC = 99;
  for (let m = 0; m < 64; m++) { const s = [1, 2, 3, 4, 5, 6].filter((_, i) => m & (1 << i)); if (AE.every(([a, b]) => s.includes(a) || s.includes(b))) optVC = Math.min(optVC, s.length); }
  check(C.size === facts.approx.size && optVC === facts.approx.optimal, 'np approx vertex cover 6 vs optimal 3');

  const D = { A: { B: 10, C: 15, D: 20 }, B: { A: 10, C: 35, D: 25 }, C: { A: 15, B: 35, D: 30 }, D: { A: 20, B: 25, C: 30 } };
  let cur = 'A', seen = ['A'], nn = 0;
  while (seen.length < 4) { const nx = ['B', 'C', 'D'].filter((c) => !seen.includes(c)).sort((a, b) => D[cur][a] - D[cur][b])[0]; nn += D[cur][nx]; seen.push(nx); cur = nx; }
  nn += D[cur].A;
  const perm = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
  let opt = 9999;
  for (const p of perm(['B', 'C', 'D'])) { const t = ['A', ...p, 'A']; let d = 0; for (let i = 0; i + 1 < t.length; i++) d += D[t[i]][t[i + 1]]; opt = Math.min(opt, d); }
  check(nn === facts.tsp.nn && opt === facts.tsp.optimal, 'np TSP nearest neighbour 80 = optimal 80');
}

assert.ok(true);
console.log(bad ? bad + ' of ' + runs + ' checks failed' : 'all ' + runs + ' checks passed');
process.exit(bad ? 1 : 0);
