/* Lesson: Coin-row problem */
(function () {
  const K = Lab.k;

  function solve(c) {
    const n = c.length, F = Array(n + 1).fill(0);
    if (n) F[1] = c[0];
    for (let i = 2; i <= n; i++) F[i] = Math.max(c[i - 1] + F[i - 2], F[i - 1]);
    const pick = [];
    let i = n;
    while (i >= 1) {
      if (i === 1) { if (F[1] > 0) pick.push(1); break; }
      if (c[i - 1] + F[i - 2] >= F[i - 1]) { pick.push(i); i -= 2; } else i -= 1;
    }
    return { F, pick: pick.reverse() };
  }

  function frames(c) {
    const n = c.length, { F, pick } = solve(c), fr = [];
    fr.push({ upto: 1, cap: `F[0] = 0 (ไม่มีเหรียญ) · F[1] = c₁ = ${c[0]} (มีเหรียญเดียวก็หยิบเลย)` });
    for (let i = 2; i <= n; i++) {
      const take = c[i - 1] + F[i - 2], skip = F[i - 1];
      fr.push({ upto: i, i, take: take >= skip,
        cap: `F[${i}] = max( หยิบ c${i} ${K(c[i - 1] + ' + F[' + (i - 2) + '] = ' + take, 'take')} , ไม่หยิบ ${K('F[' + (i - 1) + '] = ' + skip, 'skip')} ) = <b>${F[i]}</b>` });
    }
    const chosen = [];
    let i = n;
    while (i >= 1) {
      if (i === 1) { chosen.push(1); fr.push({ upto: n, back: i, chosen: chosen.slice(), cap: `ถึง F[1] → หยิบ c1` }); break; }
      if (c[i - 1] + F[i - 2] >= F[i - 1]) { chosen.push(i); fr.push({ upto: n, back: i, chosen: chosen.slice(), cap: `ย้อนรอย: F[${i}] = c${i} + F[${i - 2}] → <b>หยิบ c${i}</b> แล้วข้ามไป F[${i - 2}]` }); i -= 2; }
      else { fr.push({ upto: n, back: i, chosen: chosen.slice(), cap: `ย้อนรอย: F[${i}] = F[${i - 1}] → ไม่หยิบ c${i}` }); i -= 1; }
    }
    fr.push({ upto: n, chosen: pick, done: true, cap: `หยิบ ${pick.map((p) => 'c' + p).join(', ')} = ${pick.map((p) => c[p - 1]).join(' + ')} = <b>${F[n]}</b>` });
    return { F, fr };
  }

  function draw(el, c, F, f) {
    const n = c.length;
    const coinCls = (k) => {
      if (f.chosen && f.chosen.includes(k)) return 'ok coin';
      if (f.i === k) return (f.take ? 'hi' : 'dim') + ' coin';
      return 'coin';
    };
    const fCls = (k) => {
      if (k > f.upto) return 'empty';
      if (f.i === k) return 'cur';
      if (f.i && k === f.i - 2) return 'dg';
      if (f.i && k === f.i - 1) return 'up';
      if (f.back === k) return 'hi';
      if (f.done && k === n) return 'cur';
      return '';
    };
    el.innerHTML = Lab.cellRows([
      { label: '', idx: true, cells: [{ v: '' }, ...c.map((_, k) => ({ v: 'c' + (k + 1) }))] },
      { label: 'เหรียญ', cells: [{ v: '', cls: 'blank' }, ...c.map((v, k) => ({ v, cls: coinCls(k + 1) }))] },
      { label: '', idx: true, cells: F.map((_, k) => ({ v: k })) },
      { label: 'F', cells: F.map((v, k) => ({ v, cls: fCls(k) })) },
    ]) + `<div class="legend"><span><i style="background:var(--take)"></i>หยิบ: cᵢ + F[i−2]</span><span><i style="background:var(--skip)"></i>ไม่หยิบ: F[i−1]</span></div>`;
  }

  function mount(slot, c, speed) {
    const { F, fr } = frames(c);
    Lab.stepper(Lab.stage(slot), { frames: fr, speed, render(el, f) { draw(el, c, F, f); return f.cap; } });
  }

  Lab.register({
    id: 'coinrow', ch: 'dp', title: 'Coin-row', sub: 'หยิบเหรียญที่ไม่ติดกันให้ได้มูลค่ามากที่สุด', minutes: 7, checks: 4, slide: 'week8 หน้า 8–16',
    mount(root) {
      const L = 'coinrow';
      let s = Lab.beat(root, {
        kick: 'โจทย์',
        title: 'เหรียญเรียงเป็นแถว ห้ามหยิบสองเหรียญที่ติดกัน',
        html: `<p>เหรียญ 5, 1, 2, 10, 6, 2 ถ้าหยิบเหรียญใหญ่ก่อน (10 แล้ว 5 แล้ว 2) ได้ 17 พอดี แต่ไม่ได้การันตีทุกกรณี DP คิดให้ถูกเสมอ</p>`,
      });
      s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'มองเหรียญสุดท้าย มีแค่ 2 ทาง',
        html: `<div class="rule"><span class="lbl">หยิบ cₙ → เหรียญ n−1 ห้ามหยิบ</span>${K('cₙ + F(n−2)', 'take')}
          <span class="lbl" style="margin-top:8px">ไม่หยิบ cₙ</span>${K('F(n−1)', 'skip')}
          <span class="lbl" style="margin-top:8px">รวมกัน</span>F(n) = max( cₙ + F(n−2) , F(n−1) ) · F(0) = 0 · F(1) = c₁</div>`,
      });
      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'เติม F ทีละช่อง แล้วย้อนรอย', html: `<p>เหรียญเดียวกับสไลด์ ช่องสีส้มคือทางหยิบ ช่องสีฟ้าคือทางไม่หยิบ</p>`, wide: true });
      mount(s, [5, 1, 2, 10, 6, 2], 1100);
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'F[4] = max( 10 + F[2] , F[3] ) = ?', options: ['10', '12', '15', '17'], answer: 2, why: 'F[2] = 5, F[3] = 7 → max(15, 7) = 15' });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean">
          <li><b>F(1) = c₁</b> ไม่ใช่ 0</li>
          <li>ตอนหยิบต้องบวก <b>F(n−2)</b> (ข้ามเหรียญที่ติดกัน) ไม่ใช่ F(n−1)</li>
          <li>ย้อนรอย: ถ้า F[i] มาจาก cᵢ + F[i−2] แปลว่าหยิบ แล้วกระโดดไป i−2</li>
          <li>เวลาและ memory ${K('Θ(n)')} ไม่ต้องเรียงเหรียญ</li></ul>`,
      });

      s = Lab.beat(root, { kick: 'ลองเอง', title: 'ใส่แถวเหรียญของคุณ', html: `<p>ลองชุดจากหน้าจอโปรแกรมในสไลด์ เช่น 88 16 91 36 11 29 50 (คำตอบ 240)</p>`, wide: true });
      const f = document.createElement('div');
      f.className = 'fields';
      f.innerHTML = `<label class="field">เหรียญ (ไม่เกิน 10 เหรียญ)<input id="crIn" value="88 16 91 36 11 29 50" autocomplete="off"></label>`;
      s.append(f);
      const host = document.createElement('div');
      s.append(host);
      const rebuild = () => {
        let c = (f.querySelector('#crIn').value.match(/\d+/g) || []).map(Number).filter((x) => x < 1000).slice(0, 10);
        if (!c.length) c = [5];
        host.innerHTML = '';
        mount(host, c, 800);
      };
      f.addEventListener('change', rebuild);
      rebuild();

      Lab.exam(root, L, [
        { key: 'c2', q: 'Coin-row ของเหรียญ 2, 7, 9, 3, 1 ได้มูลค่าสูงสุดเท่าไร', options: ['10', '11', '12', '13'], answer: 2, why: 'F = 0, 2, 7, 11, 11, 12 → หยิบ 2 + 9 + 1 = 12' },
        { key: 'c3', q: 'ข้อใดคือ recurrence ของ coin-row', options: ['F(n) = F(n−1) + F(n−2)', 'F(n) = max(cₙ + F(n−1), F(n−2))', 'F(n) = max(cₙ + F(n−2), F(n−1))', 'F(n) = min(cₙ + F(n−2), F(n−1))'], answer: 2, why: 'หยิบ cₙ ต้องข้าม n−1 · ไม่หยิบใช้ F(n−1) · เลือกค่ามากกว่า' },
        { key: 'c4', q: 'ประสิทธิภาพของ coin-row แบบ DP', options: ['Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(2ⁿ)'], answer: 0, why: 'เติม F ช่องละครั้ง n ช่อง' },
      ]);
      Lab.recap(root, [
        'F(n) = max( cₙ + F(n−2) , F(n−1) )',
        'F(0) = 0 · F(1) = c₁',
        'Θ(n) · ย้อนรอยจาก F[n] เพื่อหาว่าหยิบเหรียญไหน',
      ]);
    },
  });
})();
