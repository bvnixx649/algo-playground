/* Lesson: Horspool's algorithm */
(function () {
  const { esc } = Lab;
  const K = Lab.k;

  function shiftTable(p) {
    const m = p.length, t = {};
    for (let j = 0; j < m - 1; j++) t[p[j]] = m - 1 - j;
    return t;
  }

  function frames(text, pat) {
    const m = pat.length, n = text.length, t = shiftTable(pat), F = [];
    if (!m || m > n) return [{ kind: 'nf', start: 0, cmp: [], comps: 0, cap: 'pattern ต้องสั้นกว่าหรือยาวเท่ากับ text' }];
    let i = m - 1, comps = 0;
    F.push({ kind: 'align', start: 0, cmp: [], comps, cap: `วาง pattern ชิดซ้าย แล้วเริ่มเทียบจาก<b>ตัวท้าย</b>ของ pattern`, plain: `หา ${pat} · เทียบจากตัวท้าย` });
    while (i <= n - 1) {
      const start = i - m + 1, cmp = [];
      let k = 0;
      while (k < m) {
        const tc = text[i - k], pc = pat[m - 1 - k], ok = tc === pc;
        comps++;
        cmp.push({ pos: i - k, ok });
        F.push({ kind: 'cmp', start, cmp: cmp.slice(), comps,
          cap: ok ? `${K(tc, 'ok')} ตรงกับ ${K(pc, 'ok')} → เทียบตัวถัดไปทางซ้าย` : `${K(tc, 'bad')} ไม่ตรงกับ ${K(pc, 'bad')} → หยุดเทียบ` });
        if (!ok) break;
        k++;
      }
      F[F.length - 1].last = true;
      if (k === m) {
        Object.assign(F[F.length - 1], { kind: 'found', found: true, cap: `ตรงครบ ${m} ตัว → <b>เจอที่ index ${start}</b> · เทียบไปทั้งหมด ${comps} ครั้ง`, plain: `เจอ ${pat} ที่ index ${start} · เทียบแค่ ${comps} ครั้ง` });
        return F;
      }
      const c = text[i], s = t[c] ?? m;
      F.push({ kind: 'look', start, cmp: cmp.slice(), comps, look: i, lookChar: t[c] == null ? null : c, shift: s,
        cap: `ดูตัวใน text ที่อยู่ใต้<b>ตัวท้าย pattern</b> คือ ${K(c, 'hi')} → t(${esc(c)}) = <b>${s}</b>${t[c] == null ? ' เพราะไม่อยู่ใน pattern เลย (= m)' : ''}`,
        plain: `ใต้ตัวท้ายคือ ${c} → กระโดด ${s} ช่อง` });
      i += s;
      if (i <= n - 1) F.push({ kind: 'shift', start: i - m + 1, cmp: [], comps, cap: `เลื่อน pattern ไปทางขวา ${s} ช่อง`, plain: `กระโดด ${s} ช่อง` });
    }
    const last = F[F.length - 1];
    F.push({ kind: 'nf', start: last.start, cmp: [], comps, cap: `pattern เลยท้าย text แล้ว → <b>ไม่เจอ</b> · เทียบไป ${comps} ครั้ง`, plain: 'ไม่เจอ' });
    return F;
  }

  function brute(text, pat) {
    const m = pat.length, n = text.length; let c = 0;
    for (let s = 0; s + m <= n; s++) {
      let j = 0;
      while (j < m) { c++; if (text[s + j] !== pat[j]) break; j++; }
      if (j === m) break;
    }
    return c;
  }

  function drawStrip(host, text, pat, f) {
    const key = text + '|' + pat;
    if (host.dataset.key !== key) {
      host.dataset.key = key;
      host.innerHTML = `<div class="strip" style="--n:${text.length}">
        <div class="row idx">${[...text].map((_, i) => `<div class="cell">${i}</div>`).join('')}</div>
        <div class="row text">${[...text].map((c) => `<div class="cell">${esc(c)}</div>`).join('')}</div>
        <div class="row pat">${[...pat].map((c) => `<div class="cell">${esc(c)}</div>`).join('')}</div></div>`;
    }
    const tc = host.querySelectorAll('.text .cell'), pc = host.querySelectorAll('.pat .cell'), row = host.querySelector('.pat');
    tc.forEach((c) => (c.className = 'cell'));
    pc.forEach((c) => (c.className = 'cell'));
    row.style.setProperty('--s', f.start);
    row.classList.toggle('found', !!f.found);
    for (const { pos, ok } of f.cmp || []) {
      tc[pos] && tc[pos].classList.add(ok ? 'ok' : 'bad');
      pc[pos - f.start] && pc[pos - f.start].classList.add(ok ? 'ok' : 'bad');
    }
    if (f.look != null && tc[f.look]) tc[f.look].classList.add('look');
  }

  function tableChips(pat, active) {
    const t = shiftTable(pat), seen = [];
    for (const c of pat.slice(0, -1)) if (!seen.includes(c)) seen.push(c);
    const e = (c, v, on) => `<div class="e ${on ? 'on' : ''}"><span>${esc(c)}</span><span>${v}</span></div>`;
    return seen.map((c) => e(c, t[c], active === c)).join('') + e('อื่น ๆ', pat.length, active === null);
  }

  function mountRun(slot, text, pat) {
    const stage = document.createElement('div');
    stage.className = 'stage';
    slot.append(stage);
    const bf = brute(text, pat);
    const st = Lab.stepper(stage, {
      frames: frames(text, pat),
      speed: 1100,
      render(el, f, i, all) {
        if (!el.dataset.ready || el.dataset.ready !== text + pat) {
          el.dataset.ready = text + pat;
          el.innerHTML = `<div class="scroll"><div class="sh"></div></div>
            <div class="stable"></div>
            <div class="stats"><div class="bars">
              <div class="b"><span>Horspool</span><div class="t"><i class="hb" style="background:var(--acc)"></i></div><b class="hv mono"></b></div>
              <div class="b"><span>Brute force</span><div class="t"><i class="bb" style="background:var(--ink-3)"></i></div><b class="mono">${bf}</b></div>
            </div></div>
            <div class="legend"><span><i style="background:var(--ok)"></i>ตรง</span><span><i style="background:var(--bad)"></i>ไม่ตรง</span><span><i style="background:var(--hi)"></i>ตัวที่ใช้เปิดตาราง</span></div>`;
        }
        drawStrip(el.querySelector('.sh'), text, pat, f);
        el.querySelector('.stable').innerHTML = tableChips(pat, f.kind === 'look' ? f.lookChar : undefined);
        const max = Math.max(bf, all[all.length - 1].comps, 1);
        el.querySelector('.hb').style.width = (f.comps / max) * 100 + '%';
        el.querySelector('.bb').style.width = (bf / max) * 100 + '%';
        el.querySelector('.hv').textContent = f.comps;
        return f.cap;
      },
    });
    return { stage, st };
  }

  function builder(slot) {
    const stage = document.createElement('div');
    stage.className = 'stage';
    stage.innerHTML = `<div class="fields"><label class="field">พิมพ์ pattern (A–Z)<input id="hsBuild" value="BARBER" maxlength="10" autocomplete="off" spellcheck="false"></label></div>
      <div class="scroll"><div class="builder"></div></div><div class="stable"></div>
      <div class="cap muted" style="min-height:0"></div>`;
    slot.append(stage);
    const inp = stage.querySelector('input');
    const draw = () => {
      const p = inp.value.toUpperCase().replace(/[^A-Z_]/g, '');
      if (inp.value !== p) inp.value = p;
      const m = p.length;
      const b = stage.querySelector('.builder');
      if (m < 2) { b.innerHTML = '<span class="muted">พิมพ์อย่างน้อย 2 ตัว</span>'; stage.querySelector('.stable').innerHTML = ''; return; }
      const dl = [...p].map((c, j) => {
        if (j === m - 1) return '<span class="na">–</span>';
        const later = p.slice(j + 1, m - 1).includes(c);
        return `<span class="${later ? 'x' : ''}">${m - 1 - j}</span>`;
      }).join('');
      b.innerHTML = `<div class="r pl">${[...p].map((c) => `<span>${esc(c)}</span>`).join('')}</div><div class="r dl">${dl}</div>`;
      stage.querySelector('.stable').innerHTML = tableChips(p);
      stage.querySelector('.cap').innerHTML = `ตัวเลขใต้ตัวอักษร = ระยะถึงตัวท้าย · ตัวที่ขีดฆ่าถูกทับด้วยตัวเดียวกันที่อยู่ขวากว่า · ตัวท้าย (${esc(p[m - 1])}) ไม่นับ · ตัวที่ไม่อยู่ใน pattern ได้ ${m}`;
    };
    inp.addEventListener('input', draw);
    draw();
  }

  Lab.horspool = { frames, drawStrip };

  Lab.register({
    id: 'horspool', ch: 'st', title: 'Horspool', sub: 'หา pattern ในข้อความ โดยไม่ต้องเลื่อนทีละช่อง', minutes: 8, checks: 5, slide: 'week7 หน้า 13–22',
    mount(root) {
      const L = 'horspool';
      let s = Lab.beat(root, {
        kick: 'โจทย์',
        title: 'หา BARBER ในประโยคยาว ๆ',
        html: `<p>Brute force วาง pattern แล้วเทียบ ถ้าไม่ตรงก็เลื่อนไป <b>1 ช่อง</b> แล้วเทียบใหม่ Horspool ดูตัวอักษรใน text แค่ตัวเดียว แล้วรู้เลยว่า<b>กระโดดได้กี่ช่อง</b> ทำได้เพราะเตรียมตารางเล็ก ๆ ไว้ก่อน นี่คือการแลกหน่วยความจำกับเวลา</p>
               <p>กด ${Lab.k('▶')} เพื่อดูทั้งรอบ หรือกด ${Lab.k('›')} ทีละขั้น (ใช้ปุ่มลูกศรบนคีย์บอร์ดได้)</p>`,
        wide: true,
      });
      mountRun(s, 'JIM_SAW_ME_IN_A_BARBERSHOP', 'BARBER');

      s = Lab.beat(root, {
        kick: 'ไอเดีย 1',
        title: 'เทียบจากขวาไปซ้าย',
        html: `<p>Pattern ถูกเทียบจาก<b>ตัวท้าย</b>ย้อนมาทางซ้าย พอเจอตัวที่ไม่ตรง ให้มองตัวใน text ที่อยู่<b>ใต้ตัวท้ายของ pattern</b> ตัวนั้นตัวเดียวบอกได้ว่าจะเลื่อนเท่าไร</p>`,
      });

      s = Lab.beat(root, {
        kick: 'ไอเดีย 2',
        title: 'ตาราง shift ทำครั้งเดียวก่อนเริ่ม',
        html: `<p>สำหรับตัวอักษร c แต่ละตัว ตารางเก็บค่า t(c) ไว้ว่าต้องเลื่อนกี่ช่อง</p>
          <div class="rule"><span class="lbl">กติกา</span>c อยู่ใน m−1 ตัวแรก → t(c) = ระยะจาก c <b>ตัวขวาสุด</b> ถึงตัวท้าย<br>c ไม่อยู่ใน m−1 ตัวแรก → t(c) = m (เลื่อนข้ามทั้ง pattern)</div>
          <p>ลองพิมพ์ pattern อื่นดู ตารางจะคำนวณใหม่ทันที</p>`,
      });
      builder(s);
      Lab.check(s, { lesson: L, key: 'c1', q: `pattern = ${K('LEADER')} ค่า t(E) เท่ากับเท่าไร`, options: ['1', '4', '2', '6'], answer: 0,
        why: `E ที่อยู่ขวาสุดใน LEADE คือ index 4 ห่างจากตัวท้าย 1 ช่อง (E ตัวแรกที่ index 1 ถูกทับไปแล้ว)` });

      s = Lab.beat(root, {
        kick: 'เช็ก',
        title: 'ถ้าตัวใต้ท้าย pattern ไม่อยู่ใน pattern เลย',
      });
      Lab.check(s, { lesson: L, key: 'c2', q: `กำลังหา ${K('BARBER')} แล้วตัวใน text ใต้ตัวท้ายคือ ${K('S', 'hi')} จะเลื่อนกี่ช่อง`, options: ['1', '3', '5', '6'], answer: 3,
        why: 'S ไม่อยู่ใน pattern จึงไม่มีทางที่ S จะตรงกับตัวไหนได้ → ข้ามทั้ง pattern = m = 6 ช่อง' });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean">
          <li><b>ตัวที่ใช้เปิดตาราง</b> คือตัวใน text ที่อยู่ใต้<b>ตัวท้าย</b>ของ pattern เสมอ ไม่ใช่ตัวที่เทียบแล้วไม่ตรง (Boyer-Moore ถึงจะใช้ตัวที่ไม่ตรง)</li>
          <li><b>ตัวอักษรซ้ำ</b> ให้ใช้ระยะของตัวที่อยู่<b>ขวาสุด</b> เช่น BARBER → B = 2 ไม่ใช่ 5</li>
          <li><b>ตัวท้ายของ pattern ไม่นับ</b> R ตัวท้ายของ BARBER ไม่ได้ให้ค่า 0 ค่า R = 3 มาจาก R ตัวที่ 3</li>
          <li>Worst case (เช่น text 000…0 กับ pattern 1000) ได้ ${Lab.k('Θ(nm)')} แต่กับข้อความทั่วไปเฉลี่ย ${Lab.k('Θ(n)')}</li></ul>`,
      });

      s = Lab.beat(root, {
        kick: 'ลองเอง',
        title: 'ใส่ข้อความของคุณ',
        html: `<p>ลองใส่แบบฝึกหัดท้ายสไลด์ TATACA กับ GCATCGCAGAGAGTATACAGTACG หรือพิมพ์อะไรก็ได้ (A–Z, 0–9, _)</p>`,
        wide: true,
      });
      const f = document.createElement('div');
      f.className = 'fields';
      f.innerHTML = `<label class="field">text<input id="hsText" value="GCATCGCAGAGAGTATACAGTACG" maxlength="40" autocomplete="off" spellcheck="false"></label>
        <label class="field" style="flex:0 1 180px">pattern<input id="hsPat" value="TATACA" maxlength="12" autocomplete="off" spellcheck="false"></label>`;
      s.append(f);
      const runHost = document.createElement('div');
      s.append(runHost);
      const rebuild = () => {
        const clean = (v) => v.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        const t = clean(f.querySelector('#hsText').value), p = clean(f.querySelector('#hsPat').value);
        runHost.innerHTML = '';
        mountRun(runHost, t || 'A', p || 'A');
      };
      f.addEventListener('input', (e) => { const i = e.target; const c = i.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''); if (c !== i.value) i.value = c; rebuild(); });
      rebuild();

      s = Lab.beat(root, { kick: 'ข้อสอบจำลอง', title: 'แบบที่ออกบ่อย' });
      Lab.check(s, { lesson: L, key: 'c3', label: 'ข้อ 1', q: 'Horspool ใช้ตัวอักษรตัวไหนเปิดตาราง shift', options: ['ตัวใน text ที่เทียบแล้วไม่ตรง', 'ตัวใน text ที่อยู่ใต้ตัวท้ายของ pattern', 'ตัวแรกของ pattern', 'ตัวท้ายของ pattern'], answer: 1,
        why: 'ดูตัวใต้ตัวท้ายเสมอ ไม่ว่าจะเทียบตรงมาแล้วกี่ตัว' });
      const gap = () => { const d = document.createElement('div'); d.style.height = '14px'; s.append(d); };
      gap();
      Lab.check(s, { lesson: L, key: 'c4', label: 'ข้อ 2', q: 'Worst case ของ Horspool (text ยาว n, pattern ยาว m)', options: ['Θ(n)', 'Θ(m)', 'Θ(nm)', 'Θ(n log m)'], answer: 2,
        why: 'เช่น text = 000…0 กับ pattern = 1000 ตรง m−1 ตัวทุกครั้งแล้วเลื่อนแค่ 1 ช่อง' });
      gap();
      Lab.check(s, { lesson: L, key: 'c5', label: 'ข้อ 3', q: `หา ${K('TATACA')} ใน ${K('GCATCGCAGAGAGTATACAGTACG')} ด้วย Horspool เจอที่ index ไหน`, options: ['11', '13', '15', '17'], answer: 1,
        why: 'ตาราง T=3, A=2, C=1, อื่น ๆ=6 · กระโดด 6 → 2 → 3 → 2 แล้วตรงครบที่ index 13 (ลองใส่ในช่อง "ลองเอง" ด้านบนได้)' });

      s = Lab.beat(root, {});
      s.innerHTML = `<div class="recap"><h2>สรุป 3 บรรทัด</h2><ol>
        <li>เทียบจาก<b>ขวาไปซ้าย</b> ไม่ตรงเมื่อไร ดูตัวใต้<b>ตัวท้าย</b> pattern</li>
        <li>เลื่อน t(c): ระยะจาก c ขวาสุดถึงท้าย · ไม่มีใน pattern → m</li>
        <li>worst ${Lab.k('Θ(nm)')} · เฉลี่ย ${Lab.k('Θ(n)')} · ใช้ memory ตามขนาดตัวอักษร</li></ol></div>`;
    },
  });
})();
