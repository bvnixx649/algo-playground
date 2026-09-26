/* Lesson: Hashing (open hashing / closed hashing) */
(function () {
  const { esc } = Lab;
  const K = Lab.k;
  const M = 13;
  const val = (ch) => ch.charCodeAt(0) - 64;
  const h = (w) => [...w].reduce((s, c) => s + val(c), 0) % M;

  function frames(words, mode) {
    const F = [];
    if (mode === 'open') {
      const T = Array.from({ length: M }, () => []);
      F.push({ T: T.map((x) => x.slice()), cap: 'ตารางว่าง 13 ช่อง แต่ละช่องเป็น linked list' });
      for (const w of words) {
        const k = h(w);
        T[k].push(w);
        F.push({ T: T.map((x) => x.slice()), slot: k, word: w, cap: `h(${esc(w)}) = ${[...w].reduce((s, c) => s + val(c), 0)} mod 13 = ${K(k, 'hi')}` + (T[k].length > 1 ? ` → ช่องนี้มีแล้ว (<b>collision</b>) ต่อท้าย list` : ' → ใส่ช่องนี้') });
      }
      F.push({ T: T.map((x) => x.slice()), cap: `ใส่ครบ ${words.length} คำ · load factor α = n/m = ${words.length}/13 ≈ ${(words.length / 13).toFixed(2)}` });
    } else {
      const T = Array(M).fill(null);
      F.push({ T: T.slice(), cap: 'ตารางว่าง 13 ช่อง ทุก key ต้องอยู่ในตารางเอง' });
      for (const w of words) {
        let k = h(w), tries = 0;
        if (words.indexOf(w) >= M) break;
        while (T[k] !== null && tries < M) {
          F.push({ T: T.slice(), slot: k, bad: true, word: w, cap: `${esc(w)}: ช่อง ${k} มี ${esc(T[k])} แล้ว → ไปช่องถัดไป ${(k + 1) % M}${k === M - 1 ? ' (วนกลับ 0)' : ''}` });
          k = (k + 1) % M; tries++;
        }
        if (tries >= M) break;
        T[k] = w;
        F.push({ T: T.slice(), slot: k, word: w, cap: tries ? `${esc(w)} ได้ช่อง ${K(k, 'hi')} หลังชน ${tries} ครั้ง` : `h(${esc(w)}) = ${K(k, 'hi')} ช่องว่าง → ใส่ได้เลย` });
      }
      F.push({ T: T.slice(), cap: 'ใส่ครบ · ค้นหาก็เดินแบบเดียวกัน ถ้าเจอช่องว่างก่อนแปลว่าไม่มี' });
    }
    return F;
  }

  function draw(el, f, mode) {
    el.innerHTML = `<div class="scroll"><div class="htab">${f.T.map((x, i) => {
      if (mode === 'open') {
        return `<div class="slot"><div class="i">${i}</div><div class="b ${i === f.slot ? 'hi' : ''}"></div>${x.map((w) => `<div class="ch ${w === f.word && i === f.slot ? 'hi' : ''}">${esc(w)}</div>`).join('')}</div>`;
      }
      const cls = i === f.slot ? (f.bad ? 'bad' : 'hi') : '';
      return `<div class="slot"><div class="i">${i}</div><div class="b ${cls}">${x ? esc(x) : ''}</div></div>`;
    }).join('')}</div></div>`;
  }

  function calculator(slot) {
    const st = Lab.stage(slot);
    st.innerHTML = `<div class="fields"><label class="field">พิมพ์คำ (A–Z)<input id="hcIn" value="FOOL" maxlength="10" autocomplete="off" spellcheck="false"></label></div><div class="out"></div>`;
    const drawCalc = () => {
      const i = st.querySelector('input');
      const w = i.value.toUpperCase().replace(/[^A-Z]/g, '');
      if (w !== i.value) i.value = w;
      if (!w) { st.querySelector('.out').innerHTML = ''; return; }
      const sum = [...w].reduce((s, c) => s + val(c), 0);
      st.querySelector('.out').innerHTML = `<div class="lettersum">${[...w].map((c) => `<div class="l"><b>${c}</b><span>${val(c)}</span></div>`).join('<span style="padding-bottom:22px">+</span>')}</div>
        <div class="bigeq">${[...w].map(val).join(' + ')} = ${sum} → ${sum} mod 13 = <b>${sum % M}</b></div>
        <div class="scroll" style="margin-top:12px"><div class="htab">${Array.from({ length: M }, (_, k) => `<div class="slot"><div class="i">${k}</div><div class="b ${k === sum % M ? 'hi' : ''}">${k === sum % M ? esc(w) : ''}</div></div>`).join('')}</div></div>`;
    };
    st.addEventListener('input', drawCalc);
    drawCalc();
  }

  Lab.register({
    id: 'hashing', ch: 'st', title: 'Hashing', sub: 'คำนวณเลขช่องจาก key แล้วไปที่ช่องนั้นเลย', minutes: 8, checks: 5, slide: 'week7 หน้า 32–37',
    mount(root) {
      const L = 'hashing';
      let s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'hash function แปลง key เป็นเลขช่อง',
        html: `<p>ถ้ารู้เลขช่องทันทีจาก key ก็ไม่ต้องไล่หา ค้นหา/เพิ่ม/ลบ ได้เฉลี่ย ${K('Θ(1)')} ตัวอย่างในสไลด์ให้ A = 1, B = 2, … , Z = 26 รวมกันแล้ว mod 13</p>
          <p>ลองพิมพ์ชื่อตัวเองดูว่าลงช่องไหน</p>`,
      });
      calculator(s);

      s = Lab.beat(root, {
        kick: 'ปัญหา',
        title: 'สองคำได้ช่องเดียวกัน (collision)',
        html: `<p>ARE = 1 + 18 + 5 = 24 → 11 และ SOON = 63 → 11 ชนกัน มี 2 วิธีแก้</p>
          <ul class="clean"><li><b>Open hashing</b> (separate chaining) แต่ละช่องเป็น list ชนกันก็ต่อท้าย</li>
          <li><b>Closed hashing</b> (open addressing, linear probing) ทุก key อยู่ในตาราง ช่องเต็มก็ไปช่องถัดไป</li></ul>
          <p>ใส่คำจากสไลด์ "A FOOL AND HIS MONEY ARE SOON PARTED" ทีละคำ สลับดูทั้งสองแบบได้</p>`,
        wide: true,
      });
      const bar = document.createElement('div');
      bar.style.cssText = 'display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px';
      bar.innerHTML = `<div class="seg" role="tablist"><button class="on" data-m="open">Open hashing</button><button data-m="closed">Closed hashing</button></div>
        <label class="field" style="flex:1 1 260px">คำที่จะใส่ (แก้ได้)<input id="hsWords" value="A FOOL AND HIS MONEY ARE SOON PARTED" autocomplete="off" spellcheck="false"></label>`;
      s.append(bar);
      const host = document.createElement('div');
      s.append(host);
      let mode = 'open';
      const rebuild = () => {
        const words = (bar.querySelector('#hsWords').value.toUpperCase().match(/[A-Z]+/g) || ['A']).slice(0, 13);
        host.innerHTML = '';
        Lab.stepper(Lab.stage(host), { frames: frames(words, mode), speed: 1000, render(el, f) { draw(el, f, mode); return f.cap; } });
      };
      bar.addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (!b) return; mode = b.dataset.m; bar.querySelectorAll('[data-m]').forEach((x) => x.classList.toggle('on', x === b)); rebuild(); });
      bar.addEventListener('change', rebuild);
      rebuild();

      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'แบบ closed hashing (linear probing) คำว่า PARTED (h = 12) สุดท้ายอยู่ช่องไหน', options: ['12', '0', '1', '11'], answer: 1,
        why: 'ช่อง 12 ถูก SOON ใช้ไปแล้ว (SOON ชน ARE ที่ 11 เลยไป 12) → PARTED ไปช่องถัดไปซึ่งวนกลับเป็น 0' });
      Lab.gap(s);
      Lab.check(s, { lesson: L, key: 'c2', label: 'ลองทำ', q: 'h(K) = K mod 13 ใช้ linear probing ใส่ 18, 41, 22, 44, 59, 32 ตามลำดับ · 32 อยู่ช่องไหน', options: ['6', '7', '8', '9'], answer: 2,
        why: '18→5 · 41→2 · 22→9 · 44→5 ชน→6 · 59→7 · 32→6 ชน→7 ชน→8' });

      s = Lab.beat(root, {
        kick: 'เทียบ',
        title: 'ความเร็วขึ้นกับ load factor α = n / m',
        html: `<div class="scroll"><table class="dt" style="min-width:460px"><tr><th></th><th>Open (chaining)</th><th>Closed (linear probing)</th></tr>
          <tr><td>เก็บ key ที่</td><td>list นอกตาราง</td><td>ในตาราง</td></tr>
          <tr><td>α</td><td>เกิน 1 ได้</td><td>ต้อง ≤ 1</td></tr>
          <tr><td>ค้นเจอ</td><td>≈ 1 + α/2</td><td>≈ ½ (1 + 1/(1−α))</td></tr>
          <tr><td>ค้นไม่เจอ</td><td>= α</td><td>≈ ½ (1 + 1/(1−α)²)</td></tr>
          <tr><td>ลบ</td><td>ลบออกจาก list</td><td>ต้อง lazy deletion</td></tr></table></div>`,
      });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean">
          <li>ชื่อสลับหัว <b>open hashing = separate chaining</b> · <b>closed hashing = open addressing</b></li>
          <li>Worst case ทุก key ชนช่องเดียวกัน ค้นหา ${K('Θ(n)')}</li>
          <li>hash function ที่ดี กระจาย key ทั่วตาราง คำนวณเร็ว และ m มักเป็นจำนวนเฉพาะ</li>
          <li>Hashing เป็น space–time แบบ <b>prestructuring</b> (จัดโครงสร้างข้อมูลไว้ก่อน)</li></ul>`,
      });
      Lab.exam(root, L, [
        { key: 'c3', q: '<b>Separate chaining</b> คือชื่อเรียกของ', options: ['closed hashing', 'open hashing', 'linear probing', 'open addressing'], answer: 1, why: 'ใช้ list ภายนอกตาราง จึงเรียกว่า open hashing' },
        { key: 'c4', q: 'ค้นหาใน hash table กรณีแย่ที่สุด', options: ['Θ(1)', 'Θ(log n)', 'Θ(n)', 'Θ(n²)'], answer: 2, why: 'ถ้าทุก key ลงช่องเดียวกัน ต้องไล่ทั้ง n ตัว' },
        { key: 'c5', q: 'ข้อใดเป็นเทคนิค prestructuring', options: ['Horspool', 'Distribution counting', 'Hashing', 'Comparison counting'], answer: 2, why: 'Hashing และ B-tree จัดโครงสร้างไว้ก่อน ส่วนที่เหลือเป็น input enhancement' },
      ]);
      Lab.recap(root, [
        'h(K) → เลขช่อง · ค้น/เพิ่ม/ลบ เฉลี่ย Θ(1) · แย่สุด Θ(n)',
        'Chaining ต่อ list · Linear probing ไปช่องถัดไป (วนกลับ 0)',
        'Open hashing = chaining · Closed hashing = open addressing',
      ]);
    },
  });
})();
