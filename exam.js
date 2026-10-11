/* Exam: the old paper 69-1-254383-2, 25 questions. Keys verified with the lesson solvers
   (see test.js). Two keys in the original paper were wrong; the fixes are noted in the page. */
(function () {
  const K = Lab.k;
  const LESSON = 'exam';

  /* ---- answer normalisers: turn a typed answer into one canonical string ---- */
  const N = {
    num: (x) => { const v = parseFloat(String(x).replace(',', '.').replace(/[^0-9.\-]/g, '')); return Number.isFinite(v) ? String(+v.toFixed(6)) : ''; },
    pairs: (x) => [...String(x).toLowerCase().matchAll(/([a-z*])\s*[:=]\s*(\d+)/g)].map((m) => m[1] + ':' + m[2]).sort().join(' '),
    paths: (x) => [...String(x).toUpperCase().replace(/[→➜]/g, '->').replace(/\s+/g, '').matchAll(/([A-E](?:->[A-E])*):(\d+)/g)]
      .map((m) => m[1] + ':' + m[2]).sort().join(' '),
    matrix: (x) => (String(x).match(/\d+/g) || []).join(','),
  };

  const COINS = [3, 15, 2, 1, 3, 12, 19, 4, 7, 25, 6, 11, 18, 5, 9, 21, 14, 8, 2, 10];
  const D0 = [[0, 3, 0, 7], [8, 0, 2, 0], [5, 0, 0, 1], [2, 0, 0, 0]];

  const QUESTIONS = [
    { n: 1, q: 'ข้อใด <b>ไม่ใช่</b> คุณสมบัติพื้นฐานที่จำเป็นในการประยุกต์ใช้ Dynamic Programming?',
      o: ['Optimal Substructure', 'Overlapping Subproblems', 'Greedy Choice Property', 'Memory for Storing Solutions (Table/Array)'], a: 2,
      why: 'Greedy Choice Property เป็นของ Greedy · DP ต้องการ optimal substructure + overlapping subproblems + ที่จดคำตอบ' },
    { n: 2, q: 'ตาราง DP ของ 0/1 Knapsack ที่ W = น้ำหนักที่รับได้ และ N = จำนวนสิ่งของ มีขนาดเท่าใด?',
      o: ['(N) x (W)', '(N + 1) x (W + 1)', '(N^2) x (W^2)', '2^(N + W)'], a: 1,
      why: 'มีแถว 0 (ไม่มีของ) และคอลัมน์ 0 (เป้จุ 0) เพิ่มมา → (N + 1) x (W + 1)' },
    { n: 3, q: `Coin-row: ห้ามเลือกเหรียญที่ติดกัน ให้มูลค่ารวมมากที่สุด<br><span class="mono">[${COINS.join(', ')}]</span><br>ตอบเฉพาะตัวเลขมูลค่ารวมสูงสุด (เช่น 16)`,
      ans: '119', mode: 'num',
      show: '119',
      work: () => `F(i) = max(cᵢ + F(i−2), F(i−1)) → หยิบเหรียญที่ ${Lab.core.coinrow.solve(COINS).pick.join(', ')}<br>= ${Lab.core.coinrow.solve(COINS).pick.map((i) => COINS[i - 1]).join(' + ')} = <b>119</b><br><span style="color:var(--ink-3)">หมายเหตุ: เฉลยในข้อสอบเดิมให้คะแนนข้อนี้ผิด คำตอบ 119 ถูกต้อง</span>` },
    { n: 4, q: `Dijkstra จากจุดเริ่ม <b>A</b> — กราฟ: A→B (5) · A→C (1) · C→B (1) · B→D (3) · C→D (8) · C→E (1) · E→B (2) · E→D (2)<br>
        ตอบเส้นทางพร้อมระยะทางไปทุกจุด เรียงตามตัวอักษร เช่น <span class="mono">A->B:20 A->B->C:50</span>`,
      ans: 'A->C->B:2 A->C:1 A->C->E->D:4 A->C->E:2', mode: 'paths',
      show: 'A->C->B:2 A->C:1 A->C->E->D:4 A->C->E:2',
      work: `d(C) = 1 · d(B) = A→C→B = 1+1 = 2 · d(E) = A→C→E = 1+1 = 2 · d(D) = A→C→E→D = 1+1+2 = 4<br><span style="color:var(--ink-3)">หมายเหตุ: เฉลยในข้อสอบเดิมเขียน d(E) = 3 และ d(D) = 5 ซึ่งไม่ตรงกับน้ำหนักเส้นเชื่อมที่ให้มา</span>` },
    { n: 5, q: 'ขั้นตอน "Traceback" หรือ "Backtracking" ในการแก้ปัญหาด้วย DP ทำหน้าที่อะไร?',
      o: ['เรียงลำดับคำตอบจากน้อยไปมาก', 'ตรวจสอบว่าตาราง DP มีข้อผิดพลาดหรือไม่', 'ลบข้อมูลในตารางเพื่อคืนหน่วยความจำให้ระบบ', 'ย้อนรอยจากค่าคำตอบสูงสุดเพื่อระบุว่าสิ่งของหรือองค์ประกอบใดบ้างที่ถูกเลือก'], a: 3,
      why: 'ย้อนจากช่องคำตอบสุดท้าย → รู้ว่าชิ้นไหนถูกเลือกและเส้นทางคืออะไร' },
    { n: 6, q: 'ข้อใดกล่าวถึง Dijkstra\'s Algorithm ได้ถูกต้อง?',
      o: ['เป็น Greedy Algorithm สำหรับหา Shortest Path ที่รองรับเส้นทางที่มีน้ำหนักเป็นลบ (-)', 'ให้ผลลัพธ์ที่เป็น Minimum Spanning Tree (MST) ของกราฟเสมอ', 'คำนวณหาเส้นทางสั้นสุดโดยการเลือก Node ที่มีระยะทางสะสมน้อยที่สุดในแต่ละก้าว', 'ทำงานได้รวดเร็วเท่ากับ Breadth-First Search (BFS) ในทุกกรณี'], a: 2,
      why: 'Dijkstra เป็น greedy ที่ปิดจุดซึ่ง d น้อยที่สุดทีละจุด · น้ำหนักต้องไม่ติดลบ' },
    { n: 7, q: 'ใน Horspool\'s Algorithm ตาราง Shift Table ใช้เพื่อวัตถุประสงค์ใด?',
      o: ['กำหนดระยะการข้าม (Shift) ของ Pattern เพื่อลดเวลาค้นหา', 'จัดเรียงอักขระในข้อความค้นหาตามลำดับตัวอักษร', 'คำนวณหาความยาวของอักขระที่ซ้ำกันมากที่สุด', 'บีบอัดขนาดของข้อความต้นฉบับก่อนการค้นหา'], a: 0,
      why: 'ดูตัวอักษรใต้ตัวท้าย pattern แล้วเปิดตารางเพื่อกระโดด ไม่ต้องเลื่อนทีละช่อง' },
    { n: 8, q: 'ตาราง DP ของ 0/1 Knapsack ที่เป้จุได้ 5 kg ถ้าช่อง V[3][5] = 18 หมายความว่าอย่างไร?',
      o: ['ต้องใส่ของอย่างน้อย 3 ชิ้น เพื่อให้ได้มูลค่า 18', 'ของชิ้นที่ 3 มีน้ำหนัก 5 kg และมีมูลค่า 18', 'มีวิธีใส่ของทั้งหมด 18 วิธี', 'มูลค่าสูงสุดที่ทำได้จากของ 3 ชิ้นแรก ในเป้จุ 5 kg คือ 18'], a: 3,
      why: 'แถว = ใช้ของกี่ชิ้นแรก · คอลัมน์ = ความจุเป้ · ค่าในช่อง = มูลค่าสูงสุด' },
    { n: 9, q: 'ข้อเสียหรือความเสี่ยงที่สำคัญที่สุดของ Space and Time Trade-offs คือข้อใด?',
      o: ['โค้ดอ่านยากและซับซ้อนเกินไป', 'อาจเกิดปัญหา Out of Memory หากข้อมูลมีขนาดใหญ่มากเกินไป', 'ทำให้เวลาในการทำงานแบบ Big-O เพิ่มขึ้นเสมอ', 'ผลลัพธ์ที่ได้จะไม่ถูกต้องแม่นยำ'], a: 1,
      why: 'แลกหน่วยความจำกับความเร็ว → ข้อมูลใหญ่มากอาจไม่พอ RAM' },
    { n: 10, q: 'ความแตกต่างสำคัญระหว่าง Top-down (Memoization) กับ Bottom-up (Tabulation) ใน DP คือข้อใด?',
      o: ['Top-down ใช้ Loop ในขณะที่ Bottom-up ใช้ Recursion', 'Top-down ให้ผลลัพธ์ที่ถูกต้อง แต่ Bottom-up เป็นเพียงการประมาณค่า', 'Top-down ใช้เวลา O(N^2) ส่วน Bottom-up เป็น O(N)', 'Top-down คำนวณเฉพาะปัญหาย่อยที่ถูกเรียกใช้ ส่วน Bottom-up คำนวณปัญหาย่อยทั้งหมดตามลำดับ'], a: 3,
      why: 'Memoization คิดเท่าที่ต้องใช้จริง · Tabulation เติมตารางครบทุกช่องตามลำดับ' },
    { n: 11, q: 'เหตุใดการแก้ Fibonacci ด้วย DP จึงมีประสิทธิภาพมากกว่า Naive Recursion?',
      o: ['เพราะ Naive Recursion ให้คำตอบที่ไม่ถูกต้องในค่า N ขนาดใหญ่', 'เพราะ DP ใช้เทคนิคเรียงลำดับข้อมูลก่อนคำนวณ', 'เพราะ DP เปลี่ยนความซับซ้อนเชิงเวลาจาก O(2^N) เหลือเพียง O(N)', 'เพราะ DP ไม่ต้องใช้พื้นที่หน่วยความจำใน RAM เลย'], a: 2,
      why: 'Naive recursion คำนวณปัญหาย่อยซ้ำเป็นทวีคูณ · DP จดไว้แล้วใช้ซ้ำ' },
    { n: 12, q: 'แนวคิด Space and Time Trade-offs หมายถึงข้อใดถูกต้องที่สุด?',
      o: ['การเพิ่มขนาดข้อมูลป้อนเข้าเพื่อให้เวลาคำนวณคงที่', 'การประมวลผลที่ใช้เวลาน้อยที่สุดจะต้องไม่ใช้หน่วยความจำเพิ่มเติม', 'การลดพื้นที่หน่วยความจำจะช่วยให้อัลกอริทึมทำงานเร็วขึ้นเสมอ', 'การยอมใช้พื้นที่หน่วยความจำเพิ่มขึ้น เพื่อแลกกับความเร็วในการทำงานที่เพิ่มขึ้น'], a: 3,
      why: 'ธีมหลักของบทนี้: ยอมจ่ายหน่วยความจำ เพื่อให้เร็วขึ้น' },
    { n: 13, q: 'Huffman Coding ใช้แนวคิดแบบ Greedy เพื่อวัตถุประสงค์ใด?',
      o: ['ค้นหาเส้นทางที่สั้นที่สุดในเครือข่าย', 'ถอดรหัสไฟล์ที่ถูกเข้ารหัสแบบความปลอดภัยสูง', 'สร้างรหัสบีบอัดข้อมูลแบบความยาวผันแปร เพื่อลดขนาดไฟล์', 'เรียงลำดับตัวอักษรตามพจนานุกรม'], a: 2,
      why: 'ตัวที่ใช้บ่อยได้รหัสสั้น ตัวที่ใช้น้อยได้รหัสยาว และรหัสยัง prefix-free' },
    { n: 14, q: 'แนวคิดพื้นฐานของ Greedy Technique คืออะไร?',
      o: ['เลือกตัวเลือกที่ดีที่สุด ณ ตอนนั้น (Local Optimal Choice) ในทุกขั้นตอน', 'แก้ปัญหาย่อยทั้งหมดก่อนแล้วค่อยนำมารวมกันทีหลัง', 'ลองทำทุกวิถีที่เป็นไปได้ทั้งหมด แล้วเลือกวิธีที่ดีที่สุด', 'สุ่มเลือกคำตอบไปเรื่อย ๆ จนกว่าจะได้ผลลัพธ์ที่พอใจ'], a: 0,
      why: 'กัดทีละคำตอบที่ดีที่สุดตอนนี้ แล้วไม่ย้อนกลับ' },
    { n: 15, q: 'ปัญหาใดที่ Greedy <b>ไม่สามารถ</b> การันตีคำตอบที่ดีที่สุดระดับโลก (Global Optimum)?',
      o: ['Traveling Salesperson Problem (TSP)', 'Fractional Knapsack Problem', 'Huffman Coding', 'Minimum Spanning Tree (Prim / Kruskal)'], a: 0,
      why: 'TSP ต้องลองทุกเส้นทางแบบมีเงื่อนไข ใช้ greedy ไม่ได้ · อีกสามข้อ greedy ให้คำตอบที่ดีที่สุดเสมอ' },
    { n: 16, q: 'เหตุใด 0/1 Knapsack จึง <b>ไม่สามารถ</b> แก้ให้ได้คำตอบที่ดีที่สุดเสมอด้วย Greedy?',
      o: ['เพราะ Greedy ไม่สามารถแบ่งส่วน (Fraction) ของสิ่งของได้', 'เพราะ 0/1 Knapsack ไม่สามารถเรียงลำดับมูลค่าต่อหน่วยน้ำหนักได้', 'เพราะ Greedy ใช้เวลาประมวลผลมากกว่า Dynamic Programming', 'เพราะ 0/1 Knapsack ไม่มีคุณสมบัติ Optimal Substructure'], a: 0,
      why: 'Fractional แบ่งของได้จึงใช้ v/w แบบ greedy ได้ · 0/1 ใส่ได้ทั้งชิ้นหรือไม่ใส่ จึงต้องใช้ DP' },
    { n: 17, q: `สร้าง Shift Table ของ Horspool สำหรับ pattern <span class="mono">bacedbcdeeda</span> (ยาว 12)<br>
        ตอบในรูป <span class="mono">ตัวอักษร:ตัวเลข</span> คั่นด้วยช่องว่าง โดยใช้ <span class="mono">*</span> แทนตัวอักษรอื่น ๆ เช่น <span class="mono">a:1 b:2 *:6</span>`,
      ans: 'a:10 b:6 c:5 d:1 e:2 *:12', mode: 'pairs',
      show: 'a:10 b:6 c:5 d:1 e:2 *:12',
      work: 't(c) = m − 1 − (ตำแหน่งขวาสุดของ c ใน m−1 ตัวแรก) โดยไม่นับตัวท้าย<br>b→5, a→1, c→6, d→10, e→9 → t = 6, 10, 5, 1, 2 · ที่เหลือ = 12' },
    { n: 18, q: 'Activity Selection: ควรเรียงกิจกรรมตามเงื่อนไขใด?',
      o: ['ระยะเวลาที่ใช้ (Duration) จากมากไปน้อย', 'มูลค่าความสำคัญ (Priority) จากมากไปน้อย', 'เวลาสิ้นสุด (Finish Time) จากน้อยไปมาก', 'เวลาเริ่มต้น (Start Time) จากน้อยไปมาก'], a: 2,
      why: 'จบเร็วที่สุด → เหลือเวลาให้งานอื่นมากที่สุด' },
    { n: 19, q: `Huffman: ข้อความ 4 ตัวอักษร ความถี่ A 51% · B 25% · C 14% · D 10%<br>
        ความยาวรหัสบิตเฉลี่ย (average bits per character) เท่ากับเท่าไร?<br>ตอบทศนิยม 2 ตำแหน่ง (ปัดขึ้นทุกกรณี) เช่น 1.75`,
      ans: '1.73', mode: 'num',
      show: '1.73',
      work: 'รวม 10+14 = 24 · 24+25 = 49 · 49+51 = 100 → ความยาวรหัส A 1 · B 2 · C 3 · D 3<br>(51×1 + 25×2 + 14×3 + 10×3) / 100 = 173/100 = <b>1.73</b>' },
    { n: 20, q: 'ในปัญหา Longest Common Subsequence (LCS) ถ้า Xᵢ = Yⱼ ค่า L[i, j] คำนวณจากสูตรใด?',
      o: ['L[i-1, j] + L[i, j-1]', 'max(L[i-1, j], L[i, j-1])', 'L[i-1, j-1] + 1', 'L[i-1, j-1] + L[i-1, j]'], a: 2,
      why: 'ตัวอักษรตรงกัน → ต่อจากคำตอบของช่วงก่อนหน้า แล้ว +1 · ถ้าไม่ตรงจึงใช้ max ของสองช่อง' },
    { n: 21, q: 'Direct Address Table หรือ Counting Sort เป็น Space–Time Trade-offs ในรูปแบบใด?',
      o: ['Input Enhancement (เตรียมข้อมูลป้อนเข้าก่อนประมวลผล)', 'Greedy Choice', 'Prestructuring (สร้างโครงสร้างข้อมูลล่วงหน้า)', 'Dynamic Programming'], a: 0,
      why: 'นับความถี่ของข้อมูลจริงก่อน → input enhancement · ส่วน hashing / B-tree เป็น prestructuring' },
    { n: 22, q: 'การเปรียบเทียบ Prim กับ Kruskal ในการหา MST ข้อใดถูกต้อง?',
      o: ['Prim เป็น DP ส่วน Kruskal เป็น Greedy', 'ทั้งสองให้ MST ที่มีรูปร่างเหมือนกันเสมอ', 'Prim ขยายต้นไม้จาก Node เริ่มต้น ส่วน Kruskal ขยายจากการเลือก Edge ที่เบาที่สุดในกราฟ', 'Prim ใช้ได้เฉพาะ Directed Graph ส่วน Kruskal ใช้ได้กับ Undirected Graph เท่านั้น'], a: 2,
      why: 'Prim งอกจากจุด · Kruskal เรียง edge ทั้งกราฟแล้วหยิบ · น้ำหนักรวมเท่ากันเสมอ' },
    { n: 23, q: 'Fractional Knapsack ใช้เกณฑ์ (Greedy Criterion) ใดเลือกของเข้ากระเป๋าเป็นลำดับแรก?',
      o: ['ของที่น้ำหนักเบาที่สุดก่อน (Min Weight)', 'ของที่มีอัตราส่วน มูลค่า/น้ำหนัก สูงที่สุดก่อน (Max Value-to-Weight Ratio)', 'ของที่มีมูลค่าสูงที่สุดก่อน (Max Value)', 'ของที่มีขนาดชิ้นใหญ่ที่สุดก่อน (Max Size)'], a: 1,
      why: 'v/w มากสุดก่อน แล้วตัดแบ่งชิ้นสุดท้ายได้ (ต่างจาก 0/1 ที่ห้ามแบ่ง)' },
    { n: 24, q: 'คุณสมบัติ Overlapping Subproblems ใน DP หมายถึงอะไร?',
      o: ['ปัญหาสามารถแบ่งเป็นปัญหาย่อยที่ไม่เกี่ยวข้องกันเลย', 'ปัญหาย่อยเดิม ๆ เกิดขึ้นซ้ำ ๆ ในระหว่างการคำนวณ', 'การหาคำตอบต้องสุ่มเลือกปัญหาย่อยขึ้นมาทำทีละส่วน', 'คำตอบของปัญหาใหญ่สามารถหาได้จากคำตอบที่ดีที่สุดของปัญหาย่อยเสมอ'], a: 1,
      why: 'ปัญหาย่อยซ้ำกันคือเหตุผลที่ต้องจดคำตอบลงตาราง (ข้อสุดท้ายคือ optimal substructure ไม่ใช่ overlapping)' },
    { n: 25, q: `Floyd's Algorithm — เมทริกซ์ D(0) ของกราฟมีทิศทาง 4 จุดยอด (เลข 0 ที่ไม่ใช่แนวทแยง = ไม่มีเส้นเชื่อม)
        ${matTable()}<br>ตอบเมทริกซ์ระยะสั้นสุด D(4) ในรูป <span class="mono">[[..] [..] [..] [..]]</span>`,
      ans: '[[0 3 5 6] [5 0 2 3] [3 6 0 1] [2 5 7 0]]', mode: 'matrix',
      show: '[[0 3 5 6] [5 0 2 3] [3 6 0 1] [2 5 7 0]]',
      work: 'แวะทีละจุด k = 1, 2, 3, 4 · D⁽ᵏ⁾[i,j] = min(D[i,j], D[i,k] + D[k,j])<br>เช่น 1→3 = 1→4→1→3? ไม่ใช่ · 1→2→3 = 3+2 = 5 · 3→2 = 3→4→1→2 = 1+2+3 = 6' },
  ];

  function matTable() {
    const cells = (row, i) => row.map((x, j) => `<td${i === j ? ' class="base"' : ''}>${x}</td>`).join('');
    return `<div class="scroll"><table class="kt" style="margin-inline:auto"><tr><th>D(0)</th>${[1, 2, 3, 4].map((c) => `<th>${c}</th>`).join('')}</tr>
      ${D0.map((row, i) => `<tr><th class="rowh">${i + 1}</th>${cells(row, i)}</tr>`).join('')}</table></div>`;
  }

  /* one free-response box: check-as-you-type + the worked answer behind a fold */
  function freeBox(host, Q) {
    const work = typeof Q.work === 'function' ? Q.work() : Q.work;
    const box = document.createElement('div');
    box.className = 'check';
    box.innerHTML = `<div class="ck">ข้อ ${Q.n}</div><div class="q">${Q.q}</div>
      <div class="pbar"><input class="ans free" aria-label="คำตอบข้อ ${Q.n}">
        <button class="btn">ตรวจ</button><span class="sp"></span></div>
      <div class="fb"></div>
      <details class="symk"><summary>ดูวิธีทำ</summary><div class="calc">${work}</div></details>`;
    host.append(box);
    const inp = box.querySelector('input'), fb = box.querySelector('.fb'), btn = box.querySelector('button');
    const key = 'q' + Q.n, want = Q.mode ? N[Q.mode](Q.ans) : N.num(Q.ans);
    const right = () => {
      inp.readOnly = true; inp.classList.remove('bad'); inp.classList.add('ok');
      inp.value = Q.show;
      fb.innerHTML = `<span class="yes">ถูกต้อง</span> · เฉลย: <span class="mono">${Lab.esc(Q.show)}</span>`;
      fb.classList.add('on');
      btn.disabled = true;
      Lab.progress.mark(LESSON, key);
    };
    const check = Lab.answerInput(inp, {
      good: (v) => (Q.mode ? N[Q.mode](v) : N.num(v)) === want,
      ok: right,
      bad: (final) => {
        if (!final) return;                       // do not scold while the student is still typing
        inp.classList.remove('ok'); void inp.offsetWidth; inp.classList.add('bad');
        fb.innerHTML = '<span class="no">ยังไม่ตรง</span> · ลองอีกครั้ง หรือเปิด "ดูวิธีทำ" เพื่อเทียบเฉลย';
        fb.classList.add('on');
      },
    });
    btn.onclick = () => check(true);
    if (Lab.progress.get(LESSON).includes(key)) right();
  }

  function render(root) {
    root.innerHTML = Lab.topbar('ข้อสอบเก่า 69-1-254383-2') + `
      <main class="wrap">
        <section class="hero">
          <h1>ข้อสอบเก่า 25 ข้อ</h1>
          <p class="lead">ตอบแล้วรู้ผลทันที ข้อเขียนพิมพ์คำตอบแล้วระบบตรวจให้ (เปิด "ดูวิธีทำ" เพื่อดูเฉลยและวิธีคิด) · เฉลยทุกข้อตรวจใหม่ด้วยโปรแกรมแล้ว — ข้อ 3 และข้อ 4 ของข้อสอบเดิมเฉลยผิด (ดูหมายเหตุใน "ดูวิธีทำ")</p>
          <div class="pbar"><div class="calc" style="margin-top:0">ตอบถูก <b class="score">0</b>/${QUESTIONS.length} ข้อ</div>
            <span class="sp"></span><button class="btn ghost" id="exReset">เริ่มทำใหม่</button></div>
        </section>
        <div class="qlist"></div>
        <nav class="next"><a class="btn ghost" href="#">← ทุกบทเรียน</a><a class="btn" href="#practice">ไปฝึกลงมือทำเอง →</a></nav>
      </main>`;
    const list = root.querySelector('.qlist');
    for (const Q of QUESTIONS) {
      const slot = Lab.beat(list, { kick: 'ข้อ ' + Q.n });
      if (Q.o) Lab.check(slot, { lesson: LESSON, key: 'q' + Q.n, label: 'ข้อ ' + Q.n, q: Q.q, options: Q.o, answer: Q.a, why: Q.why });
      else freeBox(slot, Q);
    }
    Lab.scoreboard({ host: list, score: root.querySelector('.score'), lesson: LESSON, keys: QUESTIONS.map((Q) => 'q' + Q.n) });
    root.querySelector('#exReset').onclick = () => { Lab.store.set('done:' + LESSON, []); render(root); };
  }

  Lab.examPage = { render, questions: QUESTIONS };
  Lab.core = Lab.core || {}; Lab.core.exam = { questions: QUESTIONS, norm: N };
})();
