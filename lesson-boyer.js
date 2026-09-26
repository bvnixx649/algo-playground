/* Lesson: Boyer-Moore */
(function () {
  const { esc } = Lab;
  const K = Lab.k;

  function t1Table(p) { const m = p.length, t = {}; for (let j = 0; j < m - 1; j++) t[p[j]] = m - 1 - j; return t; }
  function goodSuffix(p) {
    const m = p.length, d2 = {};
    for (let k = 1; k < m; k++) {
      const suf = p.slice(m - k);
      let best = null;
      for (let s = 1; s <= m; s++) {
        let ok = true;
        for (let q = 0; q < k; q++) { const pos = m - k + q - s; if (pos >= 0 && p[pos] !== suf[q]) { ok = false; break; } }
        if (ok) { const prev = m - k - 1 - s; if (prev >= 0 && p[prev] === p[m - k - 1] && m - k - s >= 0) ok = false; }
        if (ok) { best = s; break; }
      }
      d2[k] = best;
    }
    return d2;
  }

  function frames(text, pat) {
    const m = pat.length, n = text.length, t1 = t1Table(pat), d2 = goodSuffix(pat), F = [];
    if (!m || m > n) return [{ start: 0, cmp: [], comps: 0, cap: 'pattern ต้องสั้นกว่าหรือยาวเท่ากับ text' }];
    let i = m - 1, comps = 0;
    F.push({ start: 0, cmp: [], comps, cap: 'เทียบจากตัวท้ายของ pattern ไปทางซ้าย เหมือน Horspool' });
    while (i <= n - 1) {
      const start = i - m + 1, cmp = [];
      let k = 0;
      while (k < m) {
        const ok = pat[m - 1 - k] === text[i - k];
        comps++;
        cmp.push({ pos: i - k, ok });
        F.push({ start, cmp: cmp.slice(), comps, cap: ok ? `${K(text[i - k], 'ok')} ตรง → ไปตัวทางซ้าย` : `${K(text[i - k], 'bad')} ไม่ตรงกับ ${K(pat[m - 1 - k])}` });
        if (!ok) break;
        k++;
      }
      if (k === m) { Object.assign(F[F.length - 1], { found: true, cap: `ตรงครบ → <b>เจอที่ index ${start}</b> · เทียบ ${comps} ครั้ง` }); return F; }
      const c = text[i - k], tc = t1[c] ?? m, d1 = Math.max(tc - k, 1), dd2 = k ? d2[k] : null, d = k ? Math.max(d1, dd2) : d1;
      F.push({ start, cmp: cmp.slice(), comps, look: i - k, lookChar: t1[c] == null ? null : c, k, d, activeK: k || null,
        cap: `k = ${k} · c = ${K(c, 'hi')} · d₁ = max(t₁(${esc(c)}) − ${k}, 1) = max(${tc} − ${k}, 1) = <b>${d1}</b>` +
          (k ? ` · d₂(${k}) = <b>${dd2}</b> → เลื่อน max = ${K(d, 'acc')}` : ` → k = 0 ใช้ d₁ = ${K(d, 'acc')}`) });
      i += d;
      if (i <= n - 1) F.push({ start: i - m + 1, cmp: [], comps, cap: `เลื่อนไปทางขวา ${d} ช่อง` });
    }
    F.push({ start: F[F.length - 1].start, cmp: [], comps, cap: `เลย text แล้ว → <b>ไม่เจอ</b>` });
    return F;
  }

  function t1Chips(p, active) {
    const t = t1Table(p), seen = [];
    for (const c of p.slice(0, -1)) if (!seen.includes(c)) seen.push(c);
    const e = (c, v, on) => `<div class="e ${on ? 'on' : ''}"><span>${esc(c)}</span><span>${v}</span></div>`;
    return seen.map((c) => e(c, t[c], active === c)).join('') + e('อื่น ๆ', p.length, active === null);
  }
  function d2Table(p, activeK) {
    const d2 = goodSuffix(p), m = p.length;
    return `<table class="dt" style="max-width:340px"><tr><th>k</th><th>ส่วนท้ายที่ตรงแล้ว</th><th>d₂</th></tr>${Object.keys(d2).map((k) => {
      k = +k;
      const pre = esc(p.slice(0, m - k)), suf = esc(p.slice(m - k));
      const on = activeK === k;
      return `<tr><td class="${on ? 'chg' : ''}">${k}</td><td class="${on ? 'chg' : ''}" style="font-family:var(--f-mono)"><span style="opacity:.45">${pre}</span><u style="color:var(--acc)">${suf}</u></td><td class="${on ? 'chg' : ''}">${d2[k]}</td></tr>`;
    }).join('')}</table>`;
  }

  function mountRun(slot, text, pat) {
    const stage = Lab.stage(slot);
    Lab.stepper(stage, {
      frames: frames(text, pat), speed: 1300,
      render(el, f) {
        if (el.dataset.ready !== text + pat) {
          el.dataset.ready = text + pat;
          el.innerHTML = `<div class="scroll"><div class="sh"></div></div>
            <div class="row2" style="justify-content:flex-start;margin-top:16px"><div><div class="mini-h">ตาราง t₁ (bad symbol)</div><div class="stable t1" style="margin-top:0"></div></div>
            <div><div class="mini-h">ตาราง d₂ (good suffix)</div><div class="d2"></div></div></div>`;
        }
        Lab.horspool.drawStrip(el.querySelector('.sh'), text, pat, f);
        el.querySelector('.t1').innerHTML = t1Chips(pat, f.look != null ? f.lookChar : undefined);
        el.querySelector('.d2').innerHTML = d2Table(pat, f.activeK);
        return f.cap;
      },
    });
  }

  Lab.register({
    id: 'boyer', ch: 'st', title: 'Boyer-Moore', sub: 'Horspool ที่จำด้วยว่าส่วนท้ายตรงมาแล้วกี่ตัว', minutes: 9, checks: 4, slide: 'week7 หน้า 23–31',
    mount(root) {
      const L = 'boyer';
      let s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'สองตาราง เลือกตัวที่กระโดดไกลกว่า',
        html: `<p>เทียบขวาไปซ้ายเหมือน Horspool ถ้าตรงมาแล้ว <b>k</b> ตัวแล้วเจอตัวที่ไม่ตรง จะคิดระยะเลื่อน 2 แบบ</p>
          <div class="rule"><span class="lbl">① bad-symbol (c = ตัวใน text ที่ไม่ตรง)</span>d₁ = max( t₁(c) − k , 1 )
          <span class="lbl" style="margin-top:8px">② good-suffix (k ตัวท้ายที่ตรงแล้ว)</span>d₂(k) = เลื่อนให้ส่วนท้ายเดียวกันที่อยู่ซ้ายกว่ามาตรง
          <span class="lbl" style="margin-top:8px">เลื่อนจริง</span>k = 0 → d₁ · k &gt; 0 → max(d₁, d₂)</div>
          <p>t₁ คือตารางเดียวกับ Horspool แต่ใช้กับตัวที่<b>ไม่ตรง</b> แล้วลบด้วย k</p>`,
      });

      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'หา BAOBAB ใน BESS_KNEW_ABOUT_BAOBABS', html: `<p>ตัวอย่างจากสไลด์ ดูว่าช่อง d₂ ติดไฟตอนไหน</p>`, wide: true });
      mountRun(s, 'BESS_KNEW_ABOUT_BAOBABS', 'BAOBAB');
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: `ตรงมาแล้ว k = 2 ตัว ตัวที่ไม่ตรงคือ c ซึ่ง t₁(c) = 6 และ d₂(2) = 5 จะเลื่อนกี่ช่อง`, options: ['4', '5', '6', '8'], answer: 1,
        why: 'd₁ = max(6 − 2, 1) = 4 · d = max(4, 5) = 5' });

      s = Lab.beat(root, {
        kick: 'ตาราง d₂',
        title: 'อ่าน good-suffix ยังไง',
        html: `<p>ส่วนท้าย k ตัวที่ตรงแล้ว (ขีดเส้นใต้) ให้หาส่วนเดียวกันที่อยู่ซ้ายกว่า และตัวหน้ามันต้อง<b>ไม่ใช่</b>ตัวเดิม (ไม่งั้นก็พลาดซ้ำ) แล้วเลื่อนมาตรงกัน ถ้าไม่มี ให้หา prefix ที่ยาวที่สุดที่ตรงกับท้ายของส่วนนั้น ถ้าไม่มีเลย เลื่อน m</p>
          <p>ตัวอย่าง BAOBAB ที่ k = 1: ส่วนท้ายคือ B ซึ่งนำหน้าด้วย A ต้องหา B ที่ตัวหน้าไม่ใช่ A คือ B ที่ index 3 (หน้าคือ O) ห่าง 2 → d₂(1) = 2</p>`,
      });
      const st = Lab.stage(s);
      st.innerHTML = `<div class="fields"><label class="field">พิมพ์ pattern<input id="bmP" value="BAOBAB" maxlength="10" autocomplete="off" spellcheck="false"></label></div><div class="bmout"></div>`;
      const draw = () => {
        const i = st.querySelector('input');
        const p = i.value.toUpperCase().replace(/[^A-Z_]/g, '');
        if (p !== i.value) i.value = p;
        st.querySelector('.bmout').innerHTML = p.length < 2 ? '<p class="muted">พิมพ์อย่างน้อย 2 ตัว</p>' : `<div class="row2" style="justify-content:flex-start"><div><div class="mini-h">t₁</div><div class="stable" style="margin-top:0">${t1Chips(p)}</div></div><div>${d2Table(p)}</div></div>`;
      };
      st.addEventListener('input', draw);
      draw();

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'Horspool กับ Boyer-Moore ต่างกันตรงไหน',
        html: `<ul class="clean">
          <li><b>ตัวที่เปิด t₁</b> Horspool ใช้ตัวใต้<b>ตัวท้าย</b>ของ pattern · Boyer-Moore ใช้ตัวที่<b>ไม่ตรง</b> แล้วลบ k</li>
          <li>ถ้า <b>k = 0</b> ทั้งสองวิธีเลื่อนเท่ากัน (d₁ = t₁(c))</li>
          <li>t₁(c) − k ติดลบหรือเป็น 0 ได้ จึงต้องมี max(…, 1)</li>
          <li>Boyer-Moore worst case เป็นเชิงเส้น (หาตัวแรกที่เจอ) · Horspool worst ${K('Θ(nm)')}</li></ul>`,
      });

      s = Lab.beat(root, { kick: 'ลองเอง', title: 'แบบฝึกหัดท้ายสไลด์', html: `<p>TATACA ใน GCATCGCAGAGAGTATACAGTACG · Boyer-Moore เลื่อน 3 ครั้ง (6, 5, 2) ส่วน Horspool เลื่อน 4 ครั้ง</p>`, wide: true });
      const f = document.createElement('div');
      f.className = 'fields';
      f.innerHTML = `<label class="field">text<input id="bmT" value="GCATCGCAGAGAGTATACAGTACG" maxlength="40" autocomplete="off" spellcheck="false"></label><label class="field" style="flex:0 1 180px">pattern<input id="bmP2" value="TATACA" maxlength="12" autocomplete="off" spellcheck="false"></label>`;
      s.append(f);
      const host = document.createElement('div');
      s.append(host);
      const rebuild = () => {
        const cl = (v) => v.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        host.innerHTML = '';
        mountRun(host, cl(f.querySelector('#bmT').value) || 'A', cl(f.querySelector('#bmP2').value) || 'A');
      };
      f.addEventListener('input', (e) => { const c = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''); if (c !== e.target.value) e.target.value = c; rebuild(); });
      rebuild();

      Lab.exam(root, L, [
        { key: 'c2', q: 'Boyer-Moore ใช้ตัวอักษรตัวไหนเปิดตาราง t₁', options: ['ตัวใน text ใต้ตัวท้ายของ pattern', 'ตัวใน text ที่เทียบแล้วไม่ตรง', 'ตัวแรกของ pattern', 'ตัวที่ตรงล่าสุด'], answer: 1, why: 'แล้วเอา t₁(c) ลบด้วย k จำนวนตัวที่ตรงมาแล้ว' },
        { key: 'c3', q: 'Boyer-Moore ถ้าไม่ตรงตั้งแต่ตัวแรก (k = 0) จะเลื่อนเท่าไร', options: ['1', 'm', 'd₂(1)', 't₁(c)'], answer: 3, why: 'k = 0 ไม่มี good suffix ใช้ d₁ = t₁(c) − 0 เท่ากับ Horspool' },
        { key: 'c4', q: 'pattern BAOBAB ค่า d₂(1) เท่ากับ', options: ['1', '2', '5', '6'], answer: 1, why: 'ส่วนท้าย B นำหน้าด้วย A · B ที่ index 3 นำหน้าด้วย O ใช้ได้ ห่าง 2' },
      ]);
      Lab.recap(root, [
        'd₁ = max(t₁(c) − k, 1) โดย c คือตัวใน text ที่<b>ไม่ตรง</b>',
        'k = 0 → เลื่อน d₁ · k &gt; 0 → เลื่อน max(d₁, d₂(k))',
        'ใช้ 2 ตาราง (memory มากกว่า) แต่กระโดดได้ไกลกว่า Horspool',
      ]);
    },
  });
})();
