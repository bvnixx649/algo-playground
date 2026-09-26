/* Lesson: Change-making problem */
(function () {
  const K = Lab.k;
  const INF = Infinity;

  function solve(D, n) {
    const F = [0], via = [null];
    for (let i = 1; i <= n; i++) {
      let best = INF, b = null;
      for (const d of D) if (d <= i && F[i - d] + 1 < best) { best = F[i - d] + 1; b = d; }
      F.push(best); via.push(b);
    }
    return { F, via };
  }
  function greedy(D, n) {
    const out = [];
    for (const d of D.slice().sort((a, b) => b - a)) while (n >= d) { out.push(d); n -= d; }
    return n === 0 ? out : null;
  }

  function frames(D, n) {
    const { F, via } = solve(D, n), fr = [];
    fr.push({ upto: 0, cap: 'F[0] = 0 (ยอด 0 ไม่ต้องใช้เหรียญ)' });
    for (let i = 1; i <= n; i++) {
      const cand = D.filter((d) => d <= i);
      fr.push({ upto: i, i, cand: cand.map((d) => i - d), best: i - via[i],
        cap: `F[${i}] = min{ ${cand.map((d) => `F[${i}−${d}]`).join(', ')} } + 1 = min{ ${cand.map((d) => Lab.fmt(F[i - d])).join(', ')} } + 1 = <b>${Lab.fmt(F[i])}</b> <span class="muted">(เหรียญสุดท้าย = ${via[i]})</span>` });
    }
    const used = [];
    let i = n;
    while (i > 0 && via[i]) {
      used.push(via[i]);
      fr.push({ upto: n, back: i, used: used.slice(), cap: `ย้อนรอย: F[${i}] ได้ค่าต่ำสุดจากเหรียญ ${K(via[i], 'hi')} → ไปที่ F[${i - via[i]}]` });
      i -= via[i];
    }
    fr.push({ upto: n, used, done: true, cap: `ยอด ${n} ใช้ <b>${F[n]} เหรียญ</b>: ${used.join(' + ')}` });
    return { F, fr };
  }

  function draw(el, F, f) {
    const cls = (k) => {
      if (k > f.upto) return 'empty';
      if (f.i === k) return 'cur';
      if (f.cand && k === f.best) return 'dg';
      if (f.cand && f.cand.includes(k)) return 'up';
      if (f.back === k) return 'hi';
      if (f.done && k === F.length - 1) return 'cur';
      return '';
    };
    el.innerHTML = Lab.cellRows([
      { label: 'ยอด', idx: true, cells: F.map((_, k) => ({ v: k })) },
      { label: 'F', cells: F.map((v, k) => ({ v: Lab.fmt(v), cls: cls(k) })) },
    ]) + (f.used ? `<div class="pillrow" style="justify-content:center">${f.used.map((d) => `<span class="on">${d}</span>`).join('')}</div>` : '') +
      `<div class="legend"><span><i style="background:var(--skip)"></i>ตัวเลือก F[i − d]</span><span><i style="background:var(--take)"></i>ตัวที่น้อยที่สุด</span></div>`;
  }

  function mount(slot, D, n, speed) {
    const { F, fr } = frames(D, n);
    Lab.stepper(Lab.stage(slot), { frames: fr, speed, render(el, f) { draw(el, F, f); return f.cap; } });
  }

  Lab.register({
    id: 'change', ch: 'dp', title: 'Change-making', sub: 'ทอนเงินด้วยจำนวนเหรียญน้อยที่สุด', minutes: 7, checks: 3, slide: 'week8 หน้า 17–23',
    mount(root) {
      const L = 'change';
      let s = Lab.beat(root, {
        kick: 'โจทย์',
        title: 'ทอน 6 บาท มีเหรียญ 1, 3, 4',
        html: `<p>วิธีที่คนทั่วไปใช้คือหยิบเหรียญใหญ่สุดก่อน (greedy) ลองเทียบกับคำตอบจริง</p>`,
        wide: true,
      });
      const cmp = Lab.stage(s);
      const g = greedy([1, 3, 4], 6), best = [3, 3];
      cmp.innerHTML = `<div class="twin"><div class="pane"><h3>Greedy · ${g.length} เหรียญ</h3><div class="pillrow">${g.map((d) => `<span>${d}</span>`).join('')}</div><p>หยิบ 4 ก่อน เหลือ 2 ต้องใช้ 1 + 1</p></div>
        <div class="pane"><h3>DP · ${best.length} เหรียญ</h3><div class="pillrow">${best.map((d) => `<span class="on">${d}</span>`).join('')}</div><p>ลองทุกเหรียญสุดท้ายที่เป็นไปได้ แล้วเลือกที่ดีที่สุด</p></div></div>`;

      s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'เดาว่าเหรียญสุดท้ายคือเหรียญไหน',
        html: `<p>จะจ่าย n บาท เหรียญสุดท้ายเป็น d ได้ทุกแบบ ที่เหลือ n − d คิดไว้แล้วในตาราง เลือกแบบที่น้อยสุด แล้วบวก 1 สำหรับเหรียญ d</p>
          <div class="rule"><span class="lbl">recurrence</span>F(n) = min { F(n − dⱼ) : dⱼ ≤ n } + 1 · F(0) = 0</div>`,
      });
      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'เติมตาราง F[0 … 6]', wide: true });
      mount(s, [1, 3, 4], 6, 1300);
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'เหรียญ 1, 3, 4 ทอน 7 บาท ใช้น้อยสุดกี่เหรียญ', options: ['1', '2', '3', '4'], answer: 1, why: 'F[7] = min{F[6], F[4], F[3]} + 1 = min{2, 1, 1} + 1 = 2 เช่น 4 + 3' });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean"><li>ลืม <b>+1</b> (เหรียญ d ที่เพิ่งใช้)</li>
          <li>พิจารณาเฉพาะเหรียญที่ <b>d ≤ i</b></li>
          <li>greedy ถูกเฉพาะบางชุดเหรียญ เช่น 1, 2, 5, 10 (ทอน 28 ได้ 10+10+5+2+1) · ชุดแปลก ๆ อย่าง 1, 3, 4 ผิด</li>
          <li>เวลา ${K('Θ(nm)')} (m = จำนวนชนิดเหรียญ) · memory ${K('Θ(n)')}</li></ul>`,
      });

      s = Lab.beat(root, { kick: 'ลองเอง', title: 'เปลี่ยนชุดเหรียญและยอดเงิน', wide: true });
      const f = document.createElement('div');
      f.className = 'fields';
      f.innerHTML = `<label class="field">ชุดเหรียญ<input id="chD" value="1 2 5" autocomplete="off"></label><label class="field" style="flex:0 1 130px">ยอด (≤ 20)<input id="chN" type="number" min="1" max="20" value="11"></label>`;
      s.append(f);
      const note = document.createElement('p');
      note.className = 'muted';
      s.append(note);
      const host = document.createElement('div');
      s.append(host);
      const rebuild = () => {
        let D = [...new Set((f.querySelector('#chD').value.match(/\d+/g) || []).map(Number).filter((x) => x > 0 && x <= 20))].sort((a, b) => a - b).slice(0, 5);
        if (!D.includes(1)) D.unshift(1);
        const n = Math.max(1, Math.min(20, Math.round(+f.querySelector('#chN').value) || 1));
        const gr = greedy(D, n), dp = solve(D, n).F[n];
        note.innerHTML = `ใช้เหรียญ {${D.join(', ')}} (เติม 1 ให้เสมอเพื่อให้ทอนได้ทุกยอด) · greedy ได้ ${gr.length} เหรียญ · DP ได้ ${dp} เหรียญ${gr.length > dp ? ' → <b style="color:var(--bad)">greedy ผิด</b>' : ''}`;
        host.innerHTML = '';
        mount(host, D, n, 700);
      };
      f.addEventListener('change', rebuild);
      rebuild();

      Lab.exam(root, L, [
        { key: 'c2', q: 'เหรียญ {1, 3, 4} ทอน 6 บาท: greedy ใช้กี่เหรียญ และ DP ใช้กี่เหรียญ', options: ['3 และ 2', '2 และ 2', '3 และ 3', '2 และ 3'], answer: 0, why: 'greedy 4 + 1 + 1 · DP 3 + 3' },
        { key: 'c3', q: 'Change-making แบบ DP สำหรับยอด n และเหรียญ m ชนิด ใช้เวลา', options: ['Θ(n)', 'Θ(m)', 'Θ(nm)', 'Θ(n + m)'], answer: 2, why: 'n ช่อง แต่ละช่องลองเหรียญไม่เกิน m ชนิด' },
      ]);
      Lab.recap(root, [
        'F(n) = min F(n − dⱼ) + 1 · F(0) = 0',
        'Greedy ไม่รับประกันคำตอบน้อยสุด ({1, 3, 4} ทอน 6)',
        'Θ(nm) · ย้อนรอยดูว่าเหรียญสุดท้ายของแต่ละยอดคืออะไร',
      ]);
    },
  });
})();
