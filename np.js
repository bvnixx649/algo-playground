/* P, NP, NP-Hard, NP-Complete — the ใบงาน (worksheet) filled in, with a self-test.
   Every computed item is brute-force verified in test.js (see Lab.core.np). */
(function () {
  const K = Lab.k;
  const LESSON = 'np';

  /* text table: first column = row label, other cells = prose */
  const tbl = (head, rows, center) => `<div class="scroll"><table class="dt"><tr>${head.map((h) => `<th${center ? ' style="text-align:center"' : ''}>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="t"' : ''}${center && i ? ' style="text-align:center"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
  const yes = (b) => (b ? '<b style="color:var(--ok)">จริง</b>' : '<b style="color:var(--bad)">เท็จ</b>');

  /* ---------- facts used on the page; test.js recomputes all of them ---------- */
  const facts = {
    sat: { phi1: 'x₁=T, x₂=F, x₃=T', phi2: false, phi3: false },
    graph: { clique: 3, mis: 2, minVC: 3 },
    subsetSum: { a: ['2+7+10', '5+14'], b: [], c: [] },
    chromatic: 2,
    approx: { size: 6, optimal: 3 },
    tsp: { nn: 80, optimal: 80, tour: 'A→B→D→C→A' },
  };

  const QUESTIONS = [
    { n: 1, q: 'คลาสใดนิยามว่า "คำตอบ ใช่ ตรวจสอบได้ในเวลาพหุนาม"', o: ['P', 'NP', 'NP-Hard', 'NP-Complete'], a: 1,
      why: 'NP คือปัญหาที่มี certificate สั้น ๆ ให้ตรวจยืนยันได้เร็ว' },
    { n: 2, q: 'NP-Complete ต้องมีคุณสมบัติใด', o: ['อยู่ใน NP และทุกปัญหาใน NP ลดรูปมาหาได้', 'อยู่ใน P และอยู่ใน NP', 'เป็น NP-Hard อย่างเดียว ไม่ต้องอยู่ใน NP', 'ไม่มีอัลกอริทึมใดแก้ได้เลย'], a: 0,
      why: 'NP-Complete = (อยู่ใน NP) และ (NP-Hard)' },
    { n: 3, q: 'ปัญหาแรกที่ถูกพิสูจน์ว่าเป็น NP-Complete คืออะไร โดยใคร', o: ['3-SAT โดย Karp (1972)', 'SAT โดย Cook (1971) — Cook–Levin theorem', 'TSP โดย Held และ Karp', 'Clique โดย Cook'], a: 1,
      why: 'Cook พิสูจน์ว่า SAT เป็น NP-Complete; Levin ได้ผลเดียวกันแบบอิสระ' },
    { n: 4, q: 'Halting Problem จัดอยู่ในกลุ่มใด', o: ['NP-Complete', 'P', 'NP-Hard แต่ไม่อยู่ใน NP', 'NP แต่ยังไม่ทราบว่า Complete'], a: 2,
      why: 'ตัดสินใจไม่ได้ (undecidable) จึงไม่อยู่ใน NP แต่ทุกปัญหาใน NP ลดรูปมาหาได้' },
    { n: 5, q: 'O(n^100) เป็นเวลาแบบใด', o: ['Polynomial', 'Exponential', 'Quasi-polynomial', 'จำแนกไม่ได้'], a: 0,
      why: 'ดีกรีเป็นค่าคงที่ จึงเป็นพหุนาม แม้จะช้ามากในทางปฏิบัติ' },
    { n: 6, q: 'O(1.001ⁿ) เป็นเวลาแบบใด', o: ['Polynomial', 'Exponential (ไม่ใช่พหุนาม)', 'Polynomial เพราะฐานใกล้ 1', 'Θ(n log n)'], a: 1,
      why: 'ตัวแปรอยู่ในเลขชี้กำลัง → โตเกินพหุนาม แม้ฐานจะใกล้ 1' },
    { n: 7, q: '2-SAT อยู่ในคลาสใด', o: ['NP-Complete', 'P', 'NP-Hard แต่ไม่อยู่ใน P', 'ยังไม่ทราบ'], a: 1,
      why: 'แก้ได้ใน O(n+m) ด้วย SCC (ต่างจาก 3-SAT)' },
    { n: 8, q: '3-SAT อยู่ในคลาสใด', o: ['P', 'NP-Complete', 'NP แต่ยังไม่ทราบว่า Complete', 'ตัดสินใจไม่ได้'], a: 1,
      why: 'เป็น NP-Complete มาตรฐาน (ลดจาก SAT)' },
    { n: 9, q: 'ถ้า A ≤_P B และ B ∈ P ข้อใดถูก', o: ['A ∈ P', 'A ∉ P', 'B เป็น NP-Complete', 'สรุปไม่ได้'], a: 0,
      why: 'เอา algorithm ของ B มาใช้แก้ A + overhead พหุนาม → A ∈ P' },
    { n: 10, q: 'ถ้ามี algorithm เวลาพหุนามสำหรับปัญหา NP-Complete แค่ปัญหาหนึ่ง ผลที่ตามมาคือ', o: ['ไม่มีอะไรเปลี่ยน', 'P = NP', 'ปัญหา NP-Hard ทุกปัญหากลายเป็น P', 'P ≠ NP'], a: 1,
      why: 'ทุกปัญหาใน NP ลดรูปมาหาปัญหานั้นได้ → ได้ algorithm พหุนามของทุกปัญหาใน NP (NP-Hard ที่อยู่นอก NP ไม่เกี่ยว)' },
    { n: 11, q: 'Certificate ของ VERTEX COVER (ขนาด ≤ k) คืออะไร', o: ['เซตจุดยอด S ขนาด ≤ k', 'จำนวน edge ทั้งหมด', 'ค่าความจุ k', 'เส้นทางที่ผ่านทุกจุด'], a: 0,
      why: 'verifier ตรวจว่า |S| ≤ k และทุก edge มีปลายอย่างน้อยหนึ่งข้างใน S' },
    { n: 12, q: 'Knapsack มี DP เวลา O(nW) แล้วทำไมยังเป็น NP-Complete ได้', o: ['เพราะ W เป็นค่า ไม่ใช่ขนาด input (W ใช้ log W บิต) จึงเป็น pseudo-polynomial', 'เพราะ DP นั้นให้คำตอบผิด', 'เพราะ Knapsack ไม่เกี่ยวกับ NP', 'เพราะ O(nW) เป็น exponential เสมอ'], a: 0,
      why: 'NP-Completeness คิดกับความยาว input; O(nW) เป็นพหุนามในค่า W แต่ exponential ในจำนวนบิตของ W' },
    { n: 13, q: 'ปัญหาใดยังไม่ทราบว่าเป็น P หรือ NP-Complete', o: ['2-SAT', 'Clique', 'Graph Isomorphism', 'Shortest Path'], a: 2,
      why: 'Graph Isomorphism อยู่ใน NP แต่ยังไม่รู้ว่าเป็น P หรือ NP-Complete (มี quasi-polynomial algorithm)' },
    { n: 14, q: 'กลยุทธ์ใดรับประกันคำตอบภายในอัตราส่วนที่กำหนดจากคำตอบที่ดีที่สุด', o: ['Heuristic', 'Approximation Algorithm', 'Restriction', 'Randomized Algorithm'], a: 1,
      why: 'approximation มี bound เช่น 2-approximation; heuristic ไม่รับประกัน' },
    { n: 15, q: 'จากกราฟในส่วนที่ 6 Nearest Neighbour จาก A ให้ระยะรวมเท่าไร', o: ['80', '85', '95', '100'], a: 0,
      why: 'A→B→D→C→A = 10+25+30+15 = 80 เท่ากับ optimal พอดี' },
  ];

  const venn = `<svg class="gsvg" viewBox="0 0 440 252" role="img" aria-label="P อยู่ใน NP · NP-Complete = NP ∩ NP-Hard">
    <circle cx="155" cy="105" r="88" style="fill:var(--surface-2);stroke:var(--ink-3);stroke-width:2"/>
    <circle cx="255" cy="105" r="88" style="fill:color-mix(in srgb,var(--acc) 16%,transparent);stroke:var(--ink-3);stroke-width:2"/>
    <path d="M205 32.6 A88 88 0 0 1 205 177.4 A88 88 0 0 1 205 32.6 Z" style="fill:color-mix(in srgb,var(--acc) 34%,transparent);stroke:var(--ink-3);stroke-width:2"/>
    <circle cx="120" cy="125" r="36" style="fill:var(--surface);stroke:var(--ink-3);stroke-width:2"/>
    <text x="120" y="125" style="fill:var(--ink);font-family:var(--f-display);font-size:17px;font-weight:700;text-anchor:middle;dominant-baseline:central">P</text>
    <text x="80" y="26" style="fill:var(--ink);font-family:var(--f-display);font-size:16px;font-weight:600">NP</text>
    <text x="316" y="26" style="fill:var(--acc);font-family:var(--f-display);font-size:16px;font-weight:600">NP-Hard</text>
    <text x="205" y="105" style="fill:var(--ink);font-family:var(--f-display);font-size:11.5px;font-weight:700;text-anchor:middle;dominant-baseline:central">NP-Complete</text>
    <text x="220" y="236" style="fill:var(--ink-3);font-family:var(--f-body);font-size:12px;text-anchor:middle">NP-Complete = NP ∩ NP-Hard · กรณี P ≠ NP (ถ้า P = NP ทั้งสองวงจะทับกัน)</text>
  </svg>`;

  const SEC = [
    { kick: 'นิยาม', title: 'สี่คลาสที่ต้องแยกให้ออก', open: true, html: `${venn}
      <ul class="clean">
        <li><b>P</b> — ปัญหาที่ <i>แก้ได้</i> (ตัดสินใจได้) ในเวลาพหุนาม เช่น sorting, shortest path, 2-SAT</li>
        <li><b>NP</b> — ปัญหาที่คำตอบ "ใช่" มี <b>certificate</b> สั้น ๆ ที่ <i>ตรวจสอบ</i> ได้ในเวลาพหุนาม (NP ไม่ได้แปลว่า "ไม่ polynomial")</li>
        <li><b>NP-Hard</b> — ยากอย่างน้อยเท่าทุกปัญหาใน NP คือทุกปัญหาใน NP ลดรูปมาหาได้ในเวลาพหุนาม · <b>ไม่จำเป็นต้องอยู่ใน NP</b> (เช่น Halting Problem)</li>
        <li><b>NP-Complete</b> — อยู่ใน NP <b>และ</b> เป็น NP-Hard · เป็น "ปัญหาที่ยากที่สุดใน NP"</li>
      </ul>
      <p>ความสัมพันธ์: P ⊆ NP · NP-Complete = NP ∩ NP-Hard · NP-Hard อยู่นอก NP ได้ · ยังไม่มีใครรู้ว่า P = NP หรือไม่</p>` },
    { kick: 'แบบฝึก 1.1', title: 'Optimization → Decision Problem', html: tbl(
      ['Optimization', 'Decision (คำตอบ)'],
      [['หา Shortest Path u → v', 'มีเส้นทาง u → v ที่น้ำหนักรวม ≤ k หรือไม่'],
       ['หา Minimum Vertex Cover', 'มี vertex cover ขนาด ≤ k หรือไม่'],
       ['หา Maximum Clique', 'มี clique ขนาด ≥ k หรือไม่'],
       ['หา Minimum Graph Coloring', 'ระบายสีได้ด้วย ≤ k สี หรือไม่'],
       ['หา Minimum TSP Tour', 'มี tour ผ่านทุกจุดครั้งเดียวน้ำหนักรวม ≤ k หรือไม่']]) },
    { kick: 'แบบฝึก 1.2', title: 'Polynomial หรือ Exponential', html: tbl(
      ['Running time', 'จำแนก', 'เหตุผล'],
      [['O(n³)', '<b>Polynomial</b>', 'ดีกรีคงที่'],
       ['O(2ⁿ)', '<b>Exponential</b>', 'ตัวแปรอยู่ในเลขชี้กำลัง'],
       ['O(n log n)', '<b>Polynomial</b>', 'log n โตช้ากว่า n'],
       ['O(n!)', '<b>Exponential</b>', 'โตเร็วกว่าทุก cⁿ'],
       ['O(n²·2ⁿ)', '<b>Exponential</b>', 'มี 2ⁿ คูณอยู่'],
       ['O(n^100)', '<b>Polynomial</b>', 'ดีกรี 100 เป็นค่าคงที่ (ช้าแต่ยังพหุนาม)'],
       ['O(1.001ⁿ)', '<b>Exponential</b>', 'ฐานใกล้ 1 แต่ยังโตเกินพหุนาม'],
       ['O(n^(log n))', '<b>ไม่ใช่พหุนาม</b>', '= 2^((log n)²) quasi-polynomial']]) },
    { kick: 'แบบฝึก 1.3', title: 'Tractable หรือ Intractable', html: tbl(
      ['ปัญหา', 'จำแนก', 'หมายเหตุ'],
      [['Sorting', '<b>Tractable</b>', 'O(n log n)'],
       ['Shortest Path (Dijkstra)', '<b>Tractable</b>', 'O(E + V log V)'],
       ['Traveling Salesman (TSP)', '<b>Intractable</b>', 'NP-Hard ไม่มี polynomial ที่รู้จัก'],
       ['Minimum Spanning Tree', '<b>Tractable</b>', 'Prim/Kruskal O(E log V)'],
       ['Boolean Satisfiability (SAT)', '<b>Intractable</b>', 'NP-Complete'],
       ['Matrix Multiplication', '<b>Tractable</b>', 'O(n^2.373) ในทางทฤษฎี'],
       ['Graph Coloring (k ≥ 3)', '<b>Intractable</b>', 'NP-Complete'],
       ['Maximum Matching (bipartite)', '<b>Tractable</b>', 'O(E√V) Hopcroft–Karp'],
       ['Hamiltonian Cycle', '<b>Intractable</b>', 'NP-Complete'],
       ['2-SAT', '<b>Tractable</b>', 'O(n + m) ด้วย SCC']]) },
    { kick: 'แบบฝึก 2.1', title: 'ถูก/ผิด เรื่อง P, NP, NP-Hard, NP-Complete', html: tbl(
      ['ข้อความ', 'คำตอบ', 'เหตุผล'],
      [['ทุกปัญหาใน P อยู่ใน NP ด้วย', yes(true), 'แก้ได้เร็ว → ตรวจคำตอบได้เร็ว (ทิ้ง certificate)'],
       ['ทุกปัญหาใน NP อยู่ใน P ด้วย', '<b style="color:var(--hi-ink);background:var(--hi);border-radius:6px;padding:1px 6px">ยังไม่ทราบ</b>', 'นี่คือคำถาม P vs NP (เชื่อว่าไม่จริง)'],
       ['ถ้า P = NP ปัญหา NP-Complete ทุกปัญหาอยู่ใน P', yes(true), 'NP-Complete ⊆ NP และ NP = P'],
       ['ปัญหา NP-Hard ทุกปัญหาอยู่ใน NP', yes(false), 'Halting Problem เป็น NP-Hard แต่ไม่อยู่ใน NP'],
       ['ปัญหา NP-Complete ทุกปัญหาเป็น NP-Hard', yes(true), 'ตามนิยาม'],
       ['มี algorithm พหุนามของ NP-Complete ตัวหนึ่ง → P = NP', yes(true), 'ทุกปัญหาใน NP ลดรูปมาหามันได้'],
       ['Halting Problem เป็น NP-Complete', yes(false), 'ตัดสินใจไม่ได้ จึงไม่อยู่ใน NP'],
       ['NP-Complete มี exponential time algorithm เสมอ', yes(false), 'ที่รู้จักเป็น exponential แต่ยังพิสูจน์ไม่ได้ว่าจำเป็น (ถ้า P=NP จะมีพหุนาม)']])
      + `<p style="color:var(--ink-3);font-size:14.5px">ถ้าวิชานี้ต้องการให้ตอบเป็น จริง/เท็จ ตรง ๆ โดยไม่มีการตอบ "ยังไม่ทราบ": ข้อ 2 = <b>เท็จ</b> และข้อ 8 = <b>เท็จ</b> (ภายใต้สมมติฐาน P ≠ NP ที่คอร์สนี้ใช้)</p>` },
    { kick: 'แบบฝึก 2.2', title: 'ปัญหานี้อยู่คลาสใด', html: tbl(
      ['ปัญหา', 'คลาส', 'เหตุผลสั้น ๆ'],
      [['Sorting', '<b>P</b>', 'O(n log n)'],
       ['3-SAT', '<b>NP-Complete</b>', 'ลดจาก SAT'],
       ['2-SAT', '<b>P</b>', 'SCC O(n + m)'],
       ['Clique', '<b>NP-Complete</b>', 'ลดจาก 3-SAT'],
       ['Vertex Cover', '<b>NP-Complete</b>', 'ลดจาก Clique (ผ่าน complement)'],
       ['Hamiltonian Cycle', '<b>NP-Complete</b>', 'ลดจาก Vertex Cover'],
       ['Shortest Path', '<b>P</b>', 'Dijkstra'],
       ['Subset Sum', '<b>NP-Complete</b>', 'ลดจาก 3-SAT / Exact Cover'],
       ['Graph Isomorphism', '<b>ยังไม่ทราบ</b>', 'อยู่ใน NP · ยังไม่รู้ว่า P หรือ NP-Complete'],
       ['Halting Problem', '<b>NP-Hard ไม่ใช่ NP-Complete</b>', 'undecidable → ไม่อยู่ใน NP'],
       ['TSP (Decision)', '<b>NP-Complete</b>', 'ลดจาก Hamiltonian Cycle'],
       ['Minimum Spanning Tree', '<b>P</b>', 'Prim/Kruskal'],
       ['Integer Linear Programming', '<b>NP-Complete</b>', '0/1 ILP'],
       ['Knapsack (0/1)', '<b>NP-Complete</b>', 'decision version'],
       ['Maximum Independent Set', '<b>NP-Complete</b>', 'เทียบเท่า Clique บน complement']]) },
    { kick: 'แบบฝึก 2.3', title: 'Certificate และ Verifier', html: tbl(
      ['ปัญหา', 'Certificate', 'Verifier ตรวจอะไร', 'เวลา'],
      [['CLIQUE (ขนาด k)', 'เซตจุดยอด k จุด', 'ทุกคู่ในเซตมี edge', 'O(k²)'],
       ['HAMILTONIAN CYCLE', 'ลำดับจุดยอดทั้ง n จุด', 'เป็น permutation ของ V และทุกคู่ติดกันมี edge (รวมตัวสุดท้าย → ตัวแรก)', 'O(n + E)'],
       ['SUBSET-SUM (ผลรวม = t)', 'เซตย่อย S′', 'Σ(S′) = t และ S′ ⊆ S', 'O(n)'],
       ['VERTEX COVER (ขนาด ≤ k)', 'เซตจุดยอด S', '|S| ≤ k และทุก edge มีปลายใน S', 'O(E)'],
       ['3-SAT', 'ค่า truth ของตัวแปรทุกตัว', 'ทุก clause มี literal ที่เป็นจริงอย่างน้อย 1 ตัว', 'O(n·m)']]) },
    { kick: 'แบบฝึก 3', title: 'Polynomial-Time Reduction (A ≤_P B)', html: `${tbl(
      ['ข้อความ (เมื่อ A ≤_P B)', 'คำตอบ', 'เหตุผล'],
      [['ถ้า B ∈ P แล้ว A ∈ P', yes(true), 'แก้ B ได้เร็ว → แก้ A ได้เร็ว'],
       ['ถ้า A ∉ P แล้ว B ∉ P', yes(true), 'contrapositive ของข้อ 1'],
       ['ถ้า A ∈ P แล้ว B ∈ P', yes(false), 'A ง่ายไม่บอกอะไรเกี่ยวกับ B'],
       ['ถ้า B ∉ P แล้ว A ∉ P', yes(false), 'A อาจแก้ได้เองโดยไม่ต้องใช้ B เต็มกำลัง'],
       ['B ยากอย่างน้อยเท่ากับ A', yes(true), 'B ต้องแก้ A ได้ด้วย'],
       ['A ยากอย่างน้อยเท่ากับ B', yes(false), 'เป็นทิศกลับกัน']])}
      <p><b>ทำไม reduction จึงสำคัญ:</b> ถ้า Y เป็น NP-Complete และ Y ≤_P X และ X ∈ NP แล้ว X เป็น NP-Complete ด้วย — นี่คือวิธีพิสูจน์ปัญหาใหม่โดยไม่ต้องลดจาก SAT ทุกครั้ง</p>
      <div class="rule"><span class="lbl">สูตรพิสูจน์ NP-Completeness (เรียงตามนี้)</span>
      1. แสดงว่า X ∈ NP (ระบุ certificate + verifier)<br>2. เลือก Y ที่รู้แล้วว่า NP-Complete<br>
      3. สร้าง reduction Y ≤_P X<br>4. พิสูจน์ความถูกต้อง (Yes-instance ↔ Yes-instance)<br>
      5. พิสูจน์ว่า reduction ใช้เวลาพหุนาม<br>6. สรุปว่า X เป็น NP-Complete</div>
      <ul class="clean">
        <li>ปัญหาแรกที่เป็น NP-Complete: <b>SAT</b> โดย <b>Stephen Cook (1971)</b> — เรียกว่า <b>Cook–Levin theorem</b> (Leonid Levin ได้ผลเดียวกันในปี 1973)</li>
        <li><b>Richard Karp (1972)</b> แสดง <b>21 ปัญหา</b> ที่เป็น NP-Complete โดยใช้ reduction ต่อ ๆ กัน</li>
        <li>ห่วงโซ่ที่ใช้บ่อย: SAT → 3-SAT → {CLIQUE, INDEPENDENT SET, VERTEX COVER, HAMILTONIAN CYCLE → TSP, SUBSET SUM → KNAPSACK, 3-COLORING}</li>
      </ul>` },
    { kick: 'แบบฝึก 4', title: 'แนวคิดของ Reduction แต่ละตัว', html: tbl(
      ['Reduction', 'วิธีสร้าง', 'ทำไมถูกต้อง'],
      [['3-SAT ≤_P CLIQUE', 'จุดยอด = literal แต่ละตัวในแต่ละ clause (clause ละ 3 จุด) · edge เชื่อม literal ที่อยู่ต่าง clause และไม่ขัดกัน · k = จำนวน clause',
        '(⇒) assignment ที่ทำให้สูตรจริง เลือก literal จริง clause ละ 1 ตัว → ต่าง clause ไม่ขัดกัน → clique ขนาด k · (⇐) clique ขนาด k เลือกได้ clause ละ 1 ตัว (edge มีแต่ระหว่าง clause) literal ที่เลือกไม่ขัดกัน → เซตเป็นจริงพร้อมกันได้'],
       ['CLIQUE ≤_P VERTEX COVER', 'ใช้ complement graph Ḡ และ k′ = |V| − k',
        'S เป็น clique ขนาด k ใน G ⟺ V−S เป็น vertex cover ขนาด |V|−k ใน Ḡ'],
       ['VERTEX COVER ≤_P HAMILTONIAN CYCLE', 'สร้าง gadget: จุดยอดแต่ละตัวแทนด้วย "โซ่" ของ k+1 จุด ที่มี k ช่องให้ edge ทอดผ่าน · edge (u,v) ของ G เชื่อมช่องของ u และ v',
        'ถ้ามี vertex cover ขนาด ≤ k ก็เดินเส้น Hamiltonian ผ่านทุกช่องได้ · ถ้ามี Hamiltonian cycle แปลว่าเลือกจุดยอด ≤ k มาคุมทุก edge'],
       ['HAMILTONIAN CYCLE ≤_P TSP', 'V′ = V · E′ = complete graph · w(e) = 1 ถ้า e ∈ E, 2 ถ้าไม่ · k = |V|',
        'cycle ที่ใช้ edge ของ G ล้วน มีน้ำหนัก n ⟺ มี tour น้ำหนัก ≤ n · ของที่ไม่มี cycle จะได้ ≥ n+1'],
       ['3-SAT ≤_P INDEPENDENT SET', 'จุดยอด = literal · edge ประเภท 1: ภายใน clause เดียวกัน (สามเหลี่ยม) · ประเภท 2: literal ที่ขัดกัน (x กับ ¬x) · k = จำนวน clause',
        'independent set ขนาด k เลือกได้ clause ละ 1 ตัว และไม่มีคู่ขัดกัน → assignment ที่ทำให้ทุก clause จริง']]) },
    { kick: 'แบบฝึก 5', title: 'ลองคำนวณเอง (เฉลย)', html: `${tbl(
      ['5.1 CNF', 'Satisfiable?', 'Assignment / เหตุผล'],
      [['φ₁ = (x₁∨x₂)∧(¬x₁∨x₃)∧(¬x₂∨¬x₃)∧(x₁∨¬x₂∨x₃)', '<b style="color:var(--ok)">Satisfiable</b>', `ค่าเดียวที่ใช้ได้: ${K('x₁=T, x₂=F, x₃=T')}`],
       ['φ₂ = (x₁)∧(¬x₁∨x₂)∧(¬x₂∨x₃)∧(¬x₁∨¬x₃)', '<b style="color:var(--bad)">Unsatisfiable</b>', 'x₁=T → ¬x₃ (จาก clause 4) → ¬x₂ (จาก clause 3) → clause 2 กลายเป็น F'],
       ['φ₃ = (x₁∨x₂)∧(¬x₁∨¬x₂)∧(x₁∨¬x₂)∧(¬x₁∨x₂)', '<b style="color:var(--bad)">Unsatisfiable</b>', 'ทั้ง 4 clause รวมกันบังคับให้ x₁ ต้องเป็น T และ F พร้อมกัน']])}
      ${tbl(['5.2 กราฟ V={1..5}, E={(1,2),(1,4),(1,5),(2,3),(2,5),(3,5),(4,5)}', 'คำตอบ'],
        [['Maximum Clique', `<b>3</b> — ${K('{1,2,5}')} ${K('{2,3,5}')} ${K('{1,4,5}')} (มี clique ขนาด 4 ไหม → <b>ไม่มี</b>)`],
         ['Minimum Vertex Cover', `<b>3</b> — ${K('{1,2,5}')} ${K('{1,3,5}')} ${K('{2,4,5}')}`],
         ['Maximum Independent Set', `<b>2</b> — ${K('{1,3}')} ${K('{2,4}')} ${K('{3,4}')}`],
         ['Max Clique + Max IS ของ Ḡ', `3 + 3 = <b>6</b> เพราะ MaxIS(Ḡ) = MaxClique(G)`],
         ['Min VC + Max IS', `3 + 2 = <b>5</b> = |V| (Gallai: cover กับ independent set เป็น complement กันเสมอ)`]])}
      ${tbl(['5.3 SUBSET-SUM', 'มีเซตย่อย?', 'เซตย่อย'],
        [['S = {2,5,7,10,14}, t = 19', '<b style="color:var(--ok)">มี (2 ชุด)</b>', `${K('2+7+10')} และ ${K('5+14')}`],
         ['S = {1,3,5,8,13}, t = 20', '<b style="color:var(--bad)">ไม่มี</b>', 'ลองทุกเซตย่อยแล้วไม่มีผลรวม 20 (ใกล้สุด 19 = 1+5+13, 21 = 8+13)'],
         ['S = {2,4,6,8}, t = 11', '<b style="color:var(--bad)">ไม่มี</b>', 'ทุกตัวเป็นเลขคู่ ผลรวมได้แต่เลขคู่']])}
      ${tbl(['5.4 GRAPH COLORING — A–B, A–C, B–D, C–D, D–E', 'คำตอบ'],
        [['2-Colorable?', `<b style="color:var(--ok)">ได้</b> — ${K('A=สี1, B=สี2, C=สี2, D=สี1, E=สี2')} (กราฟเป็น bipartite: 4-cycle A-B-D-C-A)`],
         ['3-Colorable?', '<b>ได้</b> (ได้ 2 สีก็ใช้ 3 สีได้)'],
         ['Chromatic number', '<b>2</b>'],
         ['k-Coloring เป็น NP-Complete เมื่อ', 'k ≥ <b>3</b> · เป็น P เมื่อ k = <b>2</b> (เช็ก bipartite ได้ด้วย BFS)']])}` },
    { kick: 'แบบฝึก 6', title: 'รับมือกับ NP-Complete', html: `${tbl(
      ['กลยุทธ์', 'คำอธิบาย'],
      [['Approximation Algorithm', 'B — รับประกันคำตอบภายในอัตราส่วนที่กำหนดจากคำตอบที่ดีที่สุด'],
       ['Heuristic', 'C — ทำงานดีในทางปฏิบัติ แต่ไม่รับประกันคำตอบที่ดีที่สุด'],
       ['Parameterized Algorithm', 'D — เวลา f(k)·poly(n) โดย k เป็น parameter ขนาดเล็ก'],
       ['Restriction', 'A — จำกัด input ให้เป็นกรณีพิเศษที่แก้เร็ว (เช่น planar graph)'],
       ['Randomized Algorithm', 'E — ใช้ randomness เพิ่มประสิทธิภาพ'],
       ['Exact Algorithm (exponential)', 'F — ยอมรับ exponential แต่ลด constant factor (เช่น Branch and Bound)']])}
      ${tbl(['6.2 APPROX-VERTEX-COVER (กราฟ 1–2–3 / 4–5–6)', 'ผล'],
        [['รอบ 1: เลือก (1,2)', `C = {1,2} · ลบ (1,2),(2,3),(1,4) → เหลือ ${K('(3,6),(4,5),(5,6)')}`],
         ['รอบ 2: เลือก (3,6)', `C = {1,2,3,6} · ลบ (3,6) → เหลือ ${K('(4,5),(5,6)')}`],
         ['รอบ 3: เลือก (4,5)', 'C = {1,2,3,4,5,6} · ลบ (4,5),(5,6) → ว่าง'],
         ['|C|', `<b>6</b>`],
         ['Optimal vertex cover', `<b>3</b> — ${K('{1,3,5}')} (หรือ ${K('{2,4,6}')})`],
         ['อัตราส่วน |C| / |Optimal|', `<b>6/3 = 2</b> → รับประกันไม่เกิน <b>2 เท่า</b> ของ optimal`]])}
      ${tbl(['6.3 TSP Nearest Neighbour จาก A', 'จุดที่ใกล้สุด', 'ระยะ'],
        [['A', 'B (10)', '10'], ['B', 'D (25) · C ไกล 35', '25'], ['D', 'C (30)', '30'], ['กลับ A', '—', '15']])}
      <p>Tour: ${K('A→B→D→C→A')} · ระยะรวม <b>80</b> · Optimal ก็ได้ <b>80</b> → heuristic ให้คำตอบห่างจาก optimal <b>0%</b> ในกราฟนี้ (โชคดี ไม่ได้การันตี)</p>` },
    { kick: 'แบบฝึก 7', title: 'คำถามวิเคราะห์ (แนวคำตอบ)', html: tbl(
      ['คำถาม', 'แนวคำตอบ'],
      [['ถ้า P = NP จะเกิดอะไรขึ้น', 'Cryptography แตก (RSA/ECC ถอดกุญแจได้เร็ว) · Optimization ที่เป็น NP-Hard ทั้งหมดแก้ได้ดีที่สุด · AI/ML วางแผนและเรียนได้แบบหาคำตอบที่ดีที่สุด · คณิตศาสตร์พิสูจน์ทฤษฎีอัตโนมัติได้'],
       ['ถ้า P ≠ NP จะเป็นอย่างไร', 'ไม่มี algorithm พหุนามของ NP-Hard จึงต้องพึ่ง approximation / heuristic / parameterized และความปลอดภัยของการเข้ารหัสยังอยู่'],
       ['Graph Isomorphism บอกอะไร', 'NP มีโครงสร้างภายใน ไม่ใช่ทุกปัญหาเป็น P หรือ NP-Complete — อาจมีปัญหาที่ "อยู่ตรงกลาง" (เรียกว่า NP-intermediate ตาม Ladner)'],
       ['ทำไม DP ของ Knapsack O(nW) ไม่ขัดกับ NP-Complete', 'NP-Completeness คิดกับความยาว input · W ใช้ log W บิต ดังนั้น O(nW) เป็นพหุนามใน "ค่า" แต่ exponential ใน "ขนาด" → เรียกว่า pseudo-polynomial'],
       ['สถานการณ์ 1: รถ 50 คัน ส่งของ 500 จุด', 'Vehicle Routing (ขยายจาก TSP) → NP-Hard → ใช้ heuristic/approximation (เช่น Clarke–Wright) เพราะ exact ใหญ่เกินไป'],
       ['สถานการณ์ 2: จัดตารางสอบ 200 วิชา', 'Graph Coloring / Timetabling → NP-Complete → ใช้ heuristic หรือ constraint programming'],
       ['สถานการณ์ 3: เลือก 10 ชิ้นจาก 10,000', 'Knapsack หลายเงื่อนไข (น้ำหนัก+ปริมาตร) → NP-Complete · แต่ k = 10 คงที่จึงแก้แบบ parameterized ได้ · ในทางปฏิบัติใช้ heuristic/approximation']]) },
    { kick: 'แบบฝึก 8', title: 'ตารางสรุปทุกปัญหา', html: tbl(
      ['ปัญหา', '∈ P?', '∈ NP?', 'NP-Complete?', 'NP-Hard?', 'Algorithm ที่ดีที่สุด'],
      [['Sorting', '✓', '✓', '–', '–', 'O(n log n)'],
       ['Shortest Path', '✓', '✓', '–', '–', 'O(E + V log V) Dijkstra'],
       ['2-SAT', '✓', '✓', '–', '–', 'O(n + m) SCC'],
       ['3-SAT', '?', '✓', '✓', '✓', 'exponential (Θ(2ⁿ) ขึ้นไป)'],
       ['Clique', '?', '✓', '✓', '✓', 'exponential'],
       ['Vertex Cover', '?', '✓', '✓', '✓', '2-approx · parameterized O(1.27^k)'],
       ['Independent Set', '?', '✓', '✓', '✓', 'exponential'],
       ['Hamiltonian Cycle', '?', '✓', '✓', '✓', 'O(n²·2ⁿ) Held–Karp'],
       ['TSP (Decision)', '?', '✓', '✓', '✓', 'O(n²·2ⁿ) Held–Karp · 1.5-approx Christofides'],
       ['Subset Sum', '?', '✓', '✓', '✓', 'O(n·t) pseudo-polynomial · O(2^(n/2))'],
       ['Graph Coloring (k ≥ 3)', '?', '✓', '✓', '✓', 'exponential (3-color: ~1.33ⁿ)'],
       ['Knapsack (0/1)', '?', '✓', '✓', '✓', 'O(nW) pseudo-polynomial'],
       ['Graph Isomorphism', '?', '✓', '?', '?', 'quasi-polynomial (Babai 2015)'],
       ['Halting Problem', '–', '–', '–', '✓', 'ไม่มีอัลกอริทึม (undecidable)']], true)
      + `<p style="color:var(--ink-3);font-size:14.5px">? = ยังไม่ทราบ (ถือว่า "ไม่ใช่" ตามสมมติฐาน P ≠ NP) · ✓ = ใช่ · – = ไม่ — 「∈ P?」 ของปัญหา NP-Complete ตอบ "ยังไม่ทราบ" ไม่ใช่ "ไม่" เพราะถ้า P = NP ก็จะอยู่ใน P</p>` },
    { kick: 'แบบทดสอบสั้น', title: 'Self-test 15 ข้อ', test: true },
  ];

  function render(root) {
    root.innerHTML = Lab.topbar('ใบงาน P · NP · NP-Hard · NP-Complete') + `
      <main class="wrap">
        <section class="hero">
          <h1>P, NP และ NP-Complete</h1>
          <p class="lead">ใบงานนี้เติมคำตอบให้ครบทุกข้อ ทุกตัวเลขคำนวณและตรวจด้วยโปรแกรม (ดู test.js) · อ่านส่วนที่ 1–8 แล้วปิดท้ายด้วยแบบทดสอบสั้นที่ตรวจให้ทันที</p>
          <div class="pbar"><div class="calc" style="margin-top:0">ตอบถูก <b class="score">0</b>/${QUESTIONS.length} ข้อ</div>
            <span class="sp"></span><button class="btn ghost" id="npReset">เริ่มทำใหม่</button></div>
        </section>
        <div class="body"></div>
        <nav class="next"><a class="btn ghost" href="#">← ทุกบทเรียน</a><a class="btn" href="#exam">ไปทำข้อสอบเก่า →</a></nav>
      </main>`;
    const host = root.querySelector('.body');
    for (const sec of SEC) {
      const slot = Lab.beat(host, { kick: sec.kick, title: sec.title });
      if (sec.test) {
        QUESTIONS.forEach((Q, i) => { if (i) Lab.gap(slot); Lab.check(slot, { lesson: LESSON, key: 'q' + Q.n, label: `ข้อ ${Q.n}`, q: Q.q, options: Q.o, answer: Q.a, why: Q.why }); });
      } else {
        slot.innerHTML = sec.html;
      }
    }
    Lab.recap(host, [
      'P = แก้ได้เร็ว · NP = ตรวจคำตอบ "ใช่" ได้เร็ว · NP-Complete = อยู่ใน NP และยากสุดใน NP',
      'พิสูจน์ NP-Complete: X ∈ NP → เลือก Y ที่ Complete → ลด Y ≤_P X → พิสูจน์ความถูกต้องและเวลา',
      'เจอ NP-Complete ในงานจริง → approximation / heuristic / parameterized / restriction',
    ]);
    Lab.scoreboard({ host, score: root.querySelector('.score'), lesson: LESSON, keys: QUESTIONS.map((Q) => 'q' + Q.n) });
    root.querySelector('#npReset').onclick = () => { Lab.store.set('done:' + LESSON, []); render(root); };
  }

  Lab.npPage = { render, questions: QUESTIONS };
  Lab.core = Lab.core || {}; Lab.core.np = { facts, questions: QUESTIONS };
})();
