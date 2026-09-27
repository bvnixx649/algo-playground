/* Lesson: Comparison counting & Distribution counting */
(function () {
  const K = Lab.k;

  function cmpFrames(A) {
    const n = A.length, C = Array(n).fill(0), F = [];
    F.push({ C: C.slice(), cap: 'ตั้ง Count ของทุกตัวเป็น 0 แล้วจับคู่เทียบทุกคู่ครั้งเดียว' });
    for (let i = 0; i < n - 1; i++)
      for (let j = i + 1; j < n; j++) {
        const win = A[i] < A[j] ? j : i;
        const before = C[win];
        C[win]++;
        F.push({ C: C.slice(), a: i, b: j, win, cap: `${K(A[i])} กับ ${K(A[j])} → ${K(A[win], 'hi')} ใหญ่กว่า → Count[${win}] = ${before} + 1 = ${C[win]}` });
      }
    F.push({ C: C.slice(), all: true, cap: `Count = จำนวนตัวที่<b>น้อยกว่า</b> = ตำแหน่งสุดท้ายของตัวนั้น เทียบไปทั้งหมด ${(n * (n - 1)) / 2} ครั้ง` });
    const S = Array(n).fill(null);
    for (let i = 0; i < n; i++) {
      S[C[i]] = A[i];
      F.push({ C: C.slice(), S: S.slice(), put: i, cap: `A[${i}] = ${A[i]} → S[Count[${i}]] = S[${C[i]}] = ${K('' + A[i], 'hi')}` });
    }
    F.push({ C: C.slice(), S: S.slice(), done: true, cap: 'เรียงเสร็จ ย้ายข้อมูลแค่ n ครั้ง แต่เทียบ n(n−1)/2 ครั้ง' });
    return F;
  }

  function drawCmp(el, A, f) {
    const n = A.length;
    const aCls = (i) => (i === f.a || i === f.b ? (i === f.win ? 'hi' : 'up') : f.put === i ? 'cur' : '');
    const cCls = (i) => (i === f.win ? 'hi' : f.all ? 'okl' : f.put === i ? 'cur' : '');
    const rows = [
      { label: '', idx: true, cells: A.map((_, i) => ({ v: i })) },
      { label: 'A', cells: A.map((v, i) => ({ v, cls: aCls(i) })) },
      { label: 'Count', cells: f.C.map((v, i) => ({ v, cls: cCls(i) })) },
    ];
    if (f.S) rows.push({ label: 'S', cells: f.S.map((v, i) => ({ v, cls: v == null ? 'empty' : f.put != null && i === f.C[f.put] ? 'cur' : 'okl' })) });
    el.innerHTML = Lab.cellRows(rows);
  }

  function distFrames(A) {
    const l = Math.min(...A), u = Math.max(...A), n = A.length, D = Array(u - l + 1).fill(0), F = [];
    const S = Array(n).fill(null);
    const snap = (o) => Object.assign({ D: D.slice(), S: S.slice(), l, u }, o);
    F.push(snap({ phase: 1, cap: `ค่าอยู่ในช่วง ${l}…${u} → เตรียม D ${u - l + 1} ช่อง เริ่มจากนับความถี่` }));
    for (let i = 0; i < n; i++) { const before = D[A[i] - l]; D[A[i] - l]++; F.push(snap({ phase: 1, ai: i, dj: A[i] - l, cap: `A[${i}] = ${A[i]} → D[${A[i]}] = ${before} + 1 = ${D[A[i] - l]}` })); }
    for (let j = 1; j < D.length; j++) { const before = D[j]; D[j] += D[j - 1]; F.push(snap({ phase: 2, dj: j, dprev: j - 1, cap: `สะสม: D[${j + l}] = D[${j + l - 1}] + D[${j + l}] = ${D[j - 1]} + ${before} = <b>${D[j]}</b> (ค่า ≤ ${j + l} มี ${D[j]} ตัว)` })); }
    F.push(snap({ phase: 3, cap: `D ตอนนี้บอกว่า "ช่องสุดท้าย + 1" ของแต่ละค่า ต่อไปไล่ A จาก<b>ขวาไปซ้าย</b>` }));
    for (let i = n - 1; i >= 0; i--) {
      const j = A[i] - l, before = D[j], pos = D[j] - 1;
      S[pos] = A[i]; D[j]--;
      F.push(snap({ phase: 3, ai: i, dj: j, sp: pos, cap: `A[${i}] = ${A[i]} → S[D[${A[i]}] − 1] = S[${before} − 1] = ${K('S[' + pos + ']', 'hi')} แล้วลด D[${A[i]}] เหลือ ${D[j]}` }));
    }
    F.push(snap({ done: true, cap: `เรียงเสร็จโดย<b>ไม่มีการเปรียบเทียบ</b>เลย ใช้เวลา Θ(n + (u − l))` }));
    return F;
  }

  function drawDist(el, A, f) {
    const rows = [
      { label: '', idx: true, cells: A.map((_, i) => ({ v: i })) },
      { label: 'A', cells: A.map((v, i) => ({ v, cls: i === f.ai ? 'hi' : f.phase === 3 && f.ai != null && i > f.ai ? 'dim' : '' })) },
      { label: '', idx: true, cells: f.D.map((_, j) => ({ v: 'ค่า ' + (j + f.l) })) },
      { label: f.phase === 1 ? 'D ความถี่' : 'D', cells: f.D.map((v, j) => ({ v, cls: j === f.dj ? 'hi' : j === f.dprev ? 'up' : '' })) },
      { label: '', idx: true, cells: A.map((_, i) => ({ v: i })) },
      { label: 'S', cells: f.S.map((v, i) => ({ v, cls: v == null ? 'empty' : i === f.sp ? 'cur' : 'okl' })) },
    ];
    el.innerHTML = Lab.cellRows(rows);
  }

  Lab.register({
    id: 'counting', ch: 'st', title: 'Counting Sort', sub: 'เรียงข้อมูลด้วยการนับ ไม่ใช่การสลับที่', minutes: 8, checks: 4, slide: 'week7 หน้า 6–12',
    mount(root) {
      const L = 'counting';
      let s = Lab.beat(root, {
        kick: 'แบบที่ 1',
        title: 'Comparison counting: นับว่ามีกี่ตัวที่น้อยกว่า',
        html: `<p>ถ้ามี 3 ตัวที่น้อยกว่า 62 แปลว่า 62 ต้องอยู่ช่อง <b>S[3]</b> (นับจาก 0) งานทั้งหมดคือหาตัวเลขนี้ให้ทุกตัว</p>
          <p>จับคู่ A[i] กับ A[j] (j &gt; i) ทุกคู่ครั้งเดียว ตัวที่<b>ใหญ่กว่า</b>ได้ Count + 1</p>`,
        wide: true,
      });
      const A1 = [62, 31, 84, 96, 19, 47];
      Lab.stepper(Lab.stage(s), { frames: cmpFrames(A1), speed: 900, render(el, f) { drawCmp(el, A1, f); return f.cap; } });
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: `A = 62 31 84 96 19 47 · Count ของ ${K('84')} สุดท้ายเท่ากับเท่าไร`, options: ['2', '3', '4', '5'], answer: 2,
        why: 'ตัวที่น้อยกว่า 84 มี 62, 31, 19, 47 รวม 4 ตัว → 84 อยู่ S[4]' });

      s = Lab.beat(root, {
        kick: 'แบบที่ 2',
        title: 'Distribution counting: นับความถี่ แล้วสะสม',
        html: `<p>ใช้เมื่อค่าอยู่ในช่วงแคบ ๆ [l, u] ไม่ต้องเทียบกันเลย ทำ 3 รอบ</p>
          <div class="rule"><span class="lbl">รอบ 1</span>นับว่าแต่ละค่ามีกี่ตัว
          <span class="lbl" style="margin-top:8px">รอบ 2</span>บวกสะสมจากซ้าย → D[v] = จำนวนตัวที่ ≤ v
          <span class="lbl" style="margin-top:8px">รอบ 3</span>ไล่ A จากขวาไปซ้าย วาง v ที่ S[D[v] − 1] แล้วลด D[v] ลง 1</div>`,
        wide: true,
      });
      const A2 = [13, 11, 12, 13, 12, 12];
      Lab.stepper(Lab.stage(s), { frames: distFrames(A2), speed: 1000, render(el, f) { drawDist(el, A2, f); return f.cap; } });
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c2', q: `หลังสะสมได้ D = [1, 4, 6] (ค่า 11, 12, 13) ตัวแรกที่ถูกวางคือ A[5] = 12 จะวางที่ไหน`, options: ['S[4]', 'S[3]', 'S[2]', 'S[1]'], answer: 1,
        why: 'D[12] = 4 → วางที่ 4 − 1 = S[3] แล้ว D[12] เหลือ 3 ให้ 12 ตัวถัดไป' });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean">
          <li><b>Comparison counting</b> เทียบ ${K('n(n−1)/2')} ครั้ง = ${K('Θ(n²)')} เท่า selection sort แต่ย้ายข้อมูลแค่ n ครั้ง</li>
          <li>ค่าที่เท่ากันเข้า else (Count[i] + 1) → <b>ไม่ stable</b></li>
          <li><b>Distribution counting</b> ต้องไล่<b>ขวาไปซ้าย</b> และวางที่ ${K('D[v] − 1')} → stable และใช้เวลา ${K('Θ(n + u − l)')}</li>
          <li>ทั้งสองแบบเป็น <b>input enhancement</b> (เตรียมข้อมูลช่วยก่อน) ใช้ memory เพิ่ม</li></ul>`,
      });

      s = Lab.beat(root, { kick: 'ลองเอง', title: 'ใส่ตัวเลขของคุณ (distribution counting)', html: `<p>ตัวเลข 0–20 คั่นด้วยเว้นวรรคหรือจุลภาค ไม่เกิน 10 ตัว</p>`, wide: true });
      const f = document.createElement('div');
      f.className = 'fields';
      f.innerHTML = `<label class="field">A<input id="cntA" value="3 1 1 0 3 2 4 2" autocomplete="off"></label>`;
      s.append(f);
      const host = document.createElement('div');
      s.append(host);
      const rebuild = () => {
        let A = (f.querySelector('#cntA').value.match(/\d+/g) || []).map(Number).filter((x) => x <= 20).slice(0, 10);
        if (A.length < 2) A = [2, 1];
        host.innerHTML = '';
        Lab.stepper(Lab.stage(host), { frames: distFrames(A), speed: 700, render(el, fr) { drawDist(el, A, fr); return fr.cap; } });
      };
      f.addEventListener('change', rebuild);
      rebuild();

      Lab.exam(root, L, [
        { key: 'c3', q: 'Comparison counting sort บนข้อมูล n ตัว เปรียบเทียบกี่ครั้ง', options: ['n − 1', 'n log n', 'n(n−1)/2', 'n²'], answer: 2, why: 'ทุกคู่ i &lt; j เทียบ 1 ครั้ง = (n−1) + (n−2) + … + 1' },
        { key: 'c4', q: 'ข้อใดถูกเกี่ยวกับ distribution counting', options: ['เวลา Θ(n log n)', 'ต้องไล่ A จากซ้ายไปขวา', 'stable และเวลา Θ(n + u − l)', 'เหมาะกับค่าที่อยู่ในช่วงกว้างมาก'], answer: 2,
          why: 'ไม่มีการเปรียบเทียบ ใช้เวลาเชิงเส้นถ้าช่วงค่าแคบ และการไล่จากขวาทำให้ stable' },
      ]);
      Lab.recap(root, [
        'Comparison: Count[i] = จำนวนตัวที่น้อยกว่า → S[Count[i]] · Θ(n²)',
        'Distribution: นับ → สะสม → วางจากขวาที่ D[v] − 1 · Θ(n + u − l)',
        'ทั้งคู่แลก memory (Count, D, S) กับเวลา',
      ]);
    },
  });
})();
