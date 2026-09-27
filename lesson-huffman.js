/* Lesson: Huffman trees and codes */
(function () {
  const K = Lab.k;
  const r2 = (x) => Math.round(x * 100) / 100;

  function build(freqs) {
    let cnt = 0;
    const nodes = {};
    let q = freqs.map(([s, f]) => { const id = 'L' + s; nodes[id] = { label: s, sub: Lab.fmt(f), box: true, w: f }; return { id, w: f, c: cnt++ }; });
    const fr = [];
    const roots = () => q.slice().sort((a, b) => a.w - b.w || a.c - b.c);
    fr.push({ q: roots(), nodes: { ...nodes }, cap: 'ทุกตัวอักษรเป็นต้นไม้ 1 node น้ำหนัก = ความถี่ เรียงจากน้อยไปมาก' });
    while (q.length > 1) {
      const s = roots();
      const a = s[0], b = s[1];
      fr.push({ q: s, pick: [a.id, b.id], nodes: { ...nodes }, cap: `สองต้นที่เบาที่สุดคือ ${Lab.fmt(a.w)} กับ ${Lab.fmt(b.w)} → น้ำหนักต้นใหม่ = ${Lab.fmt(a.w)} + ${Lab.fmt(b.w)} = ${K(Lab.fmt(r2(a.w + b.w)), 'hi')}` });
      const id = 'N' + cnt;
      nodes[id] = { label: Lab.fmt(r2(a.w + b.w)), l: a.id, r: b.id, w: r2(a.w + b.w) };
      q = q.filter((x) => x !== a && x !== b);
      q.push({ id, w: r2(a.w + b.w), c: cnt++ });
      fr.push({ q: roots(), fresh: id, nodes: { ...nodes }, cap: `ต้นใหม่: ${Lab.fmt(a.w)} เป็นลูกซ้าย ${Lab.fmt(b.w)} เป็นลูกขวา · เหลือ ${q.length} ต้น` });
    }
    const root = q[0].id, codes = {};
    (function walk(n, code) { const x = nodes[n]; if (x.box) { codes[x.label] = code || '0'; return; } walk(x.l, code + '0'); walk(x.r, code + '1'); })(root, '');
    const avg = r2(freqs.reduce((a, [s, f]) => a + codes[s].length * f, 0) / freqs.reduce((a, [, f]) => a + f, 0));
    fr.push({ q: [q[0]], nodes: { ...nodes }, done: true, cap: `เหลือต้นเดียว · ซ้าย = 0 ขวา = 1 · bit เฉลี่ย = Σ(ความยาวรหัส × ความถี่) / Σความถี่ = <b>${avg}</b> bit ต่อตัว` });
    return { fr, nodes, root, codes, avg };
  }

  function forest(f) {
    const one = f.q.length === 1;
    return `<div class="scroll"><div class="row2" style="align-items:flex-end;flex-wrap:nowrap;justify-content:${one ? 'center' : 'flex-start'};min-width:max-content">${f.q.map((t) => {
      const sub = {};
      (function copy(id) { const n = f.nodes[id]; sub[id] = { ...n, cls: '' }; if (!n.box) { copy(n.l); copy(n.r); } })(t.id);
      if (f.pick && f.pick.includes(t.id)) sub[t.id].cls = 'hi';
      else if (f.fresh === t.id) sub[t.id].cls = sub[t.id].box ? 'acc' : 'done';
      const leaves = Object.values(sub).filter((n) => n.box).length;
      const w = one ? Math.max(300, leaves * 80) : Math.max(90, leaves * 70), mw = one ? 580 : w;
      return `<div style="flex:${one ? '1' : 'none'};max-width:${mw}px">${Lab.tree(sub, t.id, { w, levelH: 62, r: 20, bits: f.done, maxw: mw })}</div>`;
    }).join('')}</div></div>`;
  }

  function codeTable(freqs, codes) {
    return `<table class="dt" style="max-width:520px"><tr><th>ตัวอักษร</th>${freqs.map(([s]) => `<th>${s}</th>`).join('')}</tr><tr><td class="stt">ความถี่</td>${freqs.map(([, f]) => `<td>${Lab.fmt(f)}</td>`).join('')}</tr><tr><td class="stt">รหัส</td>${freqs.map(([s]) => `<td style="color:var(--acc)">${codes[s]}</td>`).join('')}</tr></table>`;
  }

  function mount(slot, freqs) {
    const b = build(freqs);
    Lab.stepper(Lab.stage(slot), {
      frames: b.fr, speed: 1500,
      render(el, f) { el.innerHTML = forest(f) + (f.done ? `<div style="margin-top:14px" class="scroll">${codeTable(freqs, b.codes)}</div>` : ''); return f.cap; },
    });
    return b;
  }

  const SLIDE = [['A', 0.35], ['B', 0.1], ['C', 0.2], ['D', 0.2], ['_', 0.15]];

  Lab.register({
    id: 'huffman', ch: 'gr', title: 'Huffman', sub: 'รหัสยาวไม่เท่ากัน ตัวที่ใช้บ่อยได้รหัสสั้น', minutes: 9, checks: 4, slide: 'week9 หน้า 39–48',
    mount(root) {
      const L = 'huffman';
      let s = Lab.beat(root, {
        kick: 'โจทย์',
        title: 'ตัวอักษร 5 ตัว ใช้บ่อยไม่เท่ากัน',
        html: `<p>ถ้าให้ทุกตัวยาวเท่ากันต้องใช้ ⌈log₂ 5⌉ = 3 bit ต่อตัว Huffman ให้ตัวที่เจอบ่อยได้รหัสสั้นกว่า และรหัสต้องเป็น <b>prefix-free</b> คือไม่มีรหัสไหนเป็นส่วนต้นของรหัสอื่น จึงถอดรหัสได้ไม่กำกวม</p>
          <div class="rule"><span class="lbl">greedy ข้อเดียว</span>รวมสองต้นที่<b>น้ำหนักน้อยที่สุด</b>เป็นต้นใหม่ ทำซ้ำจนเหลือต้นเดียว</div>`,
      });
      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'A 0.35 · B 0.1 · C 0.2 · D 0.2 · _ 0.15', html: `<p>ตัวอย่างจากสไลด์ ต้นที่ถูกเลือกเป็นสีเหลือง ต้นที่เพิ่งสร้างเป็นสีเข้ม</p>`, wide: true });
      const main = mount(s, SLIDE);
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'จากรหัสที่ได้ (A = 11, B = 100, C = 00, D = 01, _ = 101) เฉลี่ยกี่ bit ต่อตัวอักษร', options: ['2.0', '2.25', '2.5', '3'], answer: 1,
        why: '2(0.35) + 3(0.1) + 2(0.2) + 2(0.2) + 3(0.15) = 2.25 · ประหยัดกว่า 3 bit อยู่ (3 − 2.25)/3 = 25%' });

      s = Lab.beat(root, {
        kick: 'ลองใช้',
        title: 'เข้ารหัสและถอดรหัส',
        html: `<p>พิมพ์ข้อความจากตัว A B C D _ หรือพิมพ์ 0/1 เพื่อถอดรหัส อ่านจาก root ลงไปจนถึงใบ แล้วเริ่มใหม่ที่ root</p>`,
      });
      const st = Lab.stage(s);
      st.innerHTML = `<div class="fields"><label class="field">ข้อความ<input id="hfTxt" value="BAD_AD" maxlength="20" autocomplete="off" spellcheck="false"></label><label class="field">bit<input id="hfBits" value="011101" maxlength="60" autocomplete="off" spellcheck="false"></label></div><div class="out"></div>`;
      const decode = (bits) => {
        const inv = Object.fromEntries(Object.entries(main.codes).map(([k, v]) => [v, k]));
        const parts = [];
        let cur = '';
        for (const b of bits) { cur += b; if (inv[cur]) { parts.push([cur, inv[cur]]); cur = ''; } }
        return { parts, rest: cur };
      };
      const drawIO = () => {
        const ti = st.querySelector('#hfTxt'), bi = st.querySelector('#hfBits');
        const t = ti.value.toUpperCase().replace(/[^ABCD_]/g, ''); if (t !== ti.value) ti.value = t;
        const b = bi.value.replace(/[^01]/g, ''); if (b !== bi.value) bi.value = b;
        const enc = [...t].map((c) => main.codes[c]);
        const d = decode(b);
        st.querySelector('.out').innerHTML = `<div class="calc">${esc(t) || '–'} → <b>${enc.join(' | ') || '–'}</b> = ${enc.join('').length} bit (ถ้ายาวเท่ากันใช้ ${t.length * 3} bit)</div>
          <div class="calc">${b || '–'} → ${d.parts.map(([c, s]) => `${c}=<b>${s}</b>`).join(' | ') || '–'}${d.rest ? ` <span style="color:var(--bad)">(เหลือ ${d.rest} ยังไม่ครบรหัส)</span>` : ''}</div>`;
      };
      const esc = Lab.esc;
      st.addEventListener('input', drawIO);
      drawIO();
      Lab.gap(s);
      Lab.check(s, { lesson: L, key: 'c2', q: 'ใช้รหัสชุดเดียวกัน ถอด 10011011011101 ได้', options: ['BAD_AD', 'DAD_AB', 'BAD_DA', 'BCD_AD'], answer: 0, why: '100 | 11 | 01 | 101 | 11 | 01 = B A D _ A D' });

      s = Lab.beat(root, { kick: 'ลองเอง', title: 'เปลี่ยนความถี่', wide: true });
      const f = document.createElement('div');
      f.className = 'fields';
      f.innerHTML = SLIDE.map(([c, w]) => `<label class="field" style="flex:1 1 90px">${c}<input data-s="${c}" type="number" step="1" min="1" max="99" value="${Math.round(w * 100)}"></label>`).join('');
      s.append(f);
      const note = document.createElement('p');
      note.className = 'muted';
      s.append(note);
      const host = document.createElement('div');
      s.append(host);
      const rebuild = () => {
        const fq = [...f.querySelectorAll('input')].map((i) => [i.dataset.s, Math.max(1, Math.min(99, Math.round(+i.value) || 1))]);
        host.innerHTML = '';
        const b = mount(host, fq);
        const tot = fq.reduce((a, [, x]) => a + x, 0);
        note.textContent = `ใส่เป็นจำนวนครั้ง (รวม ${tot}) · เฉลี่ย ${(fq.reduce((a, [c, x]) => a + b.codes[c].length * x, 0) / tot).toFixed(2)} bit ต่อตัว`;
      };
      f.addEventListener('change', rebuild);
      rebuild();

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean"><li>รวม<b>สองต้นที่น้อยที่สุด</b>เสมอ ไม่ใช่สองตัวอักษรที่อยู่ติดกัน</li>
          <li>น้ำหนักเท่ากันเลือกตัวไหนก่อนก็ได้ รหัสอาจต่างกันแต่ bit เฉลี่ยเท่ากันเสมอ</li>
          <li>ตัวอักษรอยู่ที่<b>ใบ</b>เท่านั้น จึง prefix-free</li>
          <li>bit เฉลี่ย = Σ (ความยาวรหัส × ความถี่) · compression ratio = (bit แบบยาวเท่ากัน − bit เฉลี่ย) / bit แบบยาวเท่ากัน</li>
          <li>โจทย์ต่อเชือกใน lab คือ Huffman: ผลรวมของการรวมทุกครั้ง = ค่าใช้จ่ายรวม</li></ul>`,
      });
      Lab.exam(root, L, [
        { key: 'c3', q: 'A 0.4, B 0.3, C 0.2, D 0.1 → Huffman ใช้เฉลี่ยกี่ bit ต่อตัว', options: ['1.7', '1.9', '2.0', '2.1'], answer: 1, why: 'รวม D+C = 0.3, 0.3+B = 0.6, 0.6+A = 1.0 → ความยาว A1 B2 C3 D3 → 0.4 + 0.6 + 0.6 + 0.3 = 1.9' },
        { key: 'c4', q: 'ต่อเชือกยาว 4, 3, 2, 6 เป็นเส้นเดียว ค่าใช้จ่าย = ผลรวมความยาวทุกครั้งที่ต่อ น้อยสุดเท่าไร', options: ['15', '26', '29', '33'], answer: 2, why: '2+3 = 5 · 4+5 = 9 · 6+9 = 15 → 5 + 9 + 15 = 29' },
      ]);
      Lab.recap(root, [
        'รวมสองต้นที่เบาที่สุดซ้ำ ๆ จนเหลือต้นเดียว',
        'ซ้าย 0 ขวา 1 · ตัวอักษรอยู่ที่ใบ → prefix-free',
        'bit เฉลี่ย = Σ ความยาว × ความถี่ · O(n log n) ด้วย heap',
      ]);
    },
  });
})();
