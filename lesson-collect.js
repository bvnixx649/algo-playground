/* Lesson: Robot coin-collecting */
(function () {
  const K = Lab.k;
  const GRID = [
    [0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0],
  ];

  function solve(g) {
    const n = g.length, m = g[0].length, F = g.map((r) => r.map(() => 0));
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) F[i][j] = Math.max(i ? F[i - 1][j] : 0, j ? F[i][j - 1] : 0) + g[i][j];
    const path = [];
    let i = n - 1, j = m - 1;
    while (true) {
      path.push([i, j]);
      if (!i && !j) break;
      if (!i) j--; else if (!j) i--; else if (F[i - 1][j] >= F[i][j - 1]) i--; else j--;
    }
    return { F, path: path.reverse() };
  }

  function frames(g) {
    const n = g.length, m = g[0].length, { F, path } = solve(g), fr = [];
    fr.push({ upto: -1, cap: 'เริ่มที่มุมซ้ายบน เดินได้แค่ขวากับลง จุดเหลือง = มีเหรียญ' });
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) {
        const up = i ? F[i - 1][j] : null, left = j ? F[i][j - 1] : null;
        const names = [], vals = [];
        if (up != null) { names.push(`F(${i},${j + 1})`); vals.push(K(up, 'skip')); }
        if (left != null) { names.push(`F(${i + 1},${j})`); vals.push(K(left, 'take')); }
        const formula = names.length ? `max( ${names.join(' , ')} )` : '0';
        const sub = vals.length ? `max( ${vals.join(' , ')} )` : '0';
        fr.push({ upto: i * m + j, cur: [i, j], up: i ? [i - 1, j] : null, left: j ? [i, j - 1] : null,
          cap: `F(${i + 1},${j + 1}) = ${formula} + c${i + 1}${j + 1} = ${sub} + ${g[i][j]} = <b>${F[i][j]}</b>` });
      }
    for (let k = path.length - 1; k >= 1; k--) {
      const [ci, cj] = path[k], [pi, pj] = path[k - 1];
      const up = ci ? F[ci - 1][cj] : null, left = cj ? F[ci][cj - 1] : null;
      const fromUp = pi === ci - 1;
      const cap = up != null && left != null
        ? `F(${ci + 1},${cj + 1}) มาจาก max( บน F(${ci},${cj + 1}) = ${up} , ซ้าย F(${ci + 1},${cj}) = ${left} ) → ${fromUp ? 'บน' : 'ซ้าย'} มากกว่า ไปช่อง (${pi + 1},${pj + 1})`
        : `F(${ci + 1},${cj + 1}) มาได้ทางเดียวคือ (${pi + 1},${pj + 1}) เพราะติดขอบกระดาน`;
      fr.push({ upto: n * m, path: path.slice(k), cap });
    }
    fr.push({ upto: n * m, path: path.slice(0), cap: `เส้นทางที่เก็บได้ <b>${F[n - 1][m - 1]} เหรียญ</b>` });
    return { F, fr };
  }

  function board(g, F, f, edit) {
    const m = g[0].length;
    const has = (a, i, j) => a && a[0] === i && a[1] === j;
    let s = `<div class="scroll"><div class="board ${edit ? 'edit' : ''}" style="grid-template-columns:repeat(${m},auto)">`;
    g.forEach((row, i) => row.forEach((c, j) => {
      const k = i * m + j;
      let cls = k <= f.upto ? 'shown' : '';
      if (f.path && f.path.some((p) => p[0] === i && p[1] === j)) cls += ' path';
      if (has(f.cur, i, j)) cls = 'shown cur';
      else if (has(f.up, i, j)) cls += ' up';
      else if (has(f.left, i, j)) cls += ' dg';
      s += `<div class="sq ${cls}" data-i="${i}" data-j="${j}">${c ? '<span class="coin"></span>' : ''}${F[i][j]}</div>`;
    }));
    return s + '</div></div>';
  }

  Lab.register({
    id: 'collect', ch: 'dp', title: 'Coin-collecting', sub: 'หุ่นยนต์เดินขวาหรือลง เก็บเหรียญให้ได้มากที่สุด', minutes: 7, checks: 3, slide: 'week8 หน้า 24–34',
    mount(root) {
      const L = 'collect';
      let s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'ทุกช่องมาได้แค่ 2 ทาง',
        html: `<p>หุ่นยนต์เริ่มมุมซ้ายบน ไปมุมขวาล่าง เดินได้แค่<b>ขวา</b>หรือ<b>ลง</b> ดังนั้นจะมาถึงช่อง (i, j) ได้จากช่อง<b>บน</b>หรือช่อง<b>ซ้าย</b>เท่านั้น เลือกทางที่สะสมเหรียญมาได้มากกว่า แล้วบวกเหรียญในช่องนี้</p>
          <div class="rule"><span class="lbl">recurrence</span>F(i, j) = max( ${K('F(i−1, j)', 'skip')} , ${K('F(i, j−1)', 'take')} ) + cᵢⱼ
          <span class="lbl" style="margin-top:8px">ขอบ</span>นอกกระดานถือเป็น 0 · cᵢⱼ = 1 ถ้ามีเหรียญ</div>`,
      });
      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'กระดาน 5 × 6 จากสไลด์', html: `<p>เติมทีละแถว ซ้ายไปขวา แล้วย้อนหาทางเดิน</p>`, wide: true });
      const { F, fr } = frames(GRID);
      Lab.stepper(Lab.stage(s), { frames: fr, speed: 550, render(el, f) { el.innerHTML = board(GRID, F, f) + `<div class="legend" style="justify-content:center"><span><i style="background:var(--skip)"></i>บน</span><span><i style="background:var(--take)"></i>ซ้าย</span><span><i style="background:#E6B422;border-radius:50%"></i>เหรียญ</span></div>`; return f.cap; } });
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'F(2,4) = max( F(1,4), F(2,3) ) + 1 เท่ากับเท่าไร (นับแถว/คอลัมน์จาก 1)', options: ['1', '2', '3', '4'], answer: 1, why: 'F(1,4) = 0, F(2,3) = 1 → max = 1 แล้ว +1 เพราะช่อง (2,4) มีเหรียญ = 2' });

      s = Lab.beat(root, { kick: 'ลองเอง', title: 'แตะช่องเพื่อวาง/เอาเหรียญออก', html: `<p>ตัวเลขในช่องคือ F และช่องสีเหลืองคือเส้นทางที่ดีที่สุด คำนวณใหม่ทุกครั้งที่แตะ</p>`, wide: true });
      const st = Lab.stage(s);
      const g2 = GRID.map((r) => r.slice());
      const drawEdit = () => {
        const { F: F2, path } = solve(g2);
        st.innerHTML = board(g2, F2, { upto: 999, path }, true) + `<div class="cap" style="text-align:center">เก็บได้มากสุด <b>${F2[g2.length - 1][g2[0].length - 1]}</b> เหรียญ</div>`;
      };
      st.addEventListener('click', (e) => { const q = e.target.closest('.sq'); if (!q) return; const i = +q.dataset.i, j = +q.dataset.j; g2[i][j] ^= 1; drawEdit(); });
      drawEdit();

      s = Lab.beat(root, {
        kick: 'ประยุกต์',
        title: 'Computer Olympic: เลขไหนเกิดจาก 6, 9, 20',
        html: `<p>โจทย์ในสไลด์หน้า 33 ใช้ความคิดเดียวกัน z[i] = 1 ถ้า z[i−6] หรือ z[i−9] หรือ z[i−20] เป็น 1 (ใช้ซ้ำได้) ตั้งต้น z[6] = z[9] = z[20] = 1</p>
          <p>ถึง 25 ได้ 6, 9, 12, 15, 18, 20, 21, 24 เท่านั้น</p>`,
      });
      Lab.exam(root, L, [
        { key: 'c2', q: 'ใช้ 6, 9, 20 (ซ้ำได้) ประกอบเป็น 25 ได้ไหม', options: ['ได้ 6 + 9 + 10', 'ได้ 20 + 5', 'ไม่ได้', 'ได้ 9 + 9 + 6 + 1'], answer: 2, why: 'เลขที่ทำได้ ≤ 25 คือ 6, 9, 12, 15, 18, 20, 21, 24 ไม่มี 25' },
        { key: 'c3', q: 'Coin-collecting บนกระดาน n × m ใช้เวลา', options: ['Θ(n + m)', 'Θ(nm)', 'Θ((n+m)²)', 'Θ(2ⁿ⁺ᵐ)'], answer: 1, why: 'เติมตารางช่องละครั้ง n × m ช่อง' },
      ]);
      Lab.recap(root, [
        'F(i, j) = max(บน, ซ้าย) + เหรียญในช่อง',
        'คำตอบที่มุมขวาล่าง · ย้อนทางไปช่องบน/ซ้ายที่ค่ามากกว่า',
        'Θ(nm)',
      ]);
    },
  });
})();
