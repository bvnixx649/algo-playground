/* Lesson: 0/1 Knapsack (bottom-up DP) */
(function () {
  const K = Lab.k;
  const COLORS = ['#12A594', '#5B62E8', '#E8641B', '#C23F8A', '#8A6D1F'];

  function solve(items, W) {
    const n = items.length;
    const F = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= W; j++) {
        const { w, v } = items[i - 1];
        F[i][j] = w <= j ? Math.max(F[i - 1][j], v + F[i - 1][j - w]) : F[i - 1][j];
      }
    const pick = [];
    let j = W;
    for (let i = n; i >= 1; i--) if (F[i][j] !== F[i - 1][j]) { pick.push(i); j -= items[i - 1].w; }
    return { F, pick: pick.reverse() };
  }

  function fillFrames(items, W) {
    const { F } = solve(items, W), n = items.length, fr = [];
    fr.push({ upto: [0, W], cap: `แถว 0 (ไม่มีของ) และคอลัมน์ 0 (เป้จุ 0) มีค่าเป็น 0 ทั้งหมด เริ่มเติมจาก F(1,1)` });
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= W; j++) {
        const { w, v } = items[i - 1], up = F[i - 1][j];
        if (w > j) fr.push({ upto: [i, j], cur: [i, j], up: [i - 1, j], cap: `ชิ้น ${i} หนัก ${w} แต่เป้จุ ${j} ใส่ไม่ได้ → ลอกช่องบน ${K(up, 'skip')}` });
        else {
          const dg = F[i - 1][j - w];
          fr.push({ upto: [i, j], cur: [i, j], up: [i - 1, j], dg: [i - 1, j - w],
            cap: `F(${i},${j}) = max( ไม่ใส่ F(${i - 1},${j}) = ${K(up, 'skip')} , ใส่ v${i} + F(${i - 1},${j - w}) = ${v} + ${dg} = ${K(v + dg, 'take')} ) = <b>${F[i][j]}</b>` });
        }
      }
    fr.push({ upto: [n, W], done: true, cap: `เติมครบ คำตอบอยู่มุมขวาล่าง F(${n},${W}) = <b>${F[n][W]}</b>` });
    return { F, fr };
  }

  function backFrames(items, W) {
    const { F } = solve(items, W), n = items.length, fr = [], path = [], picked = [];
    let j = W;
    for (let i = n; i >= 1; i--) {
      path.push([i, j]);
      const same = F[i][j] === F[i - 1][j];
      if (same) fr.push({ path: path.slice(), cur: [i, j], up: [i - 1, j], picked: picked.slice(), cap: `F(${i},${j}) = ${F[i][j]} เท่ากับช่องบน → <b>ไม่ได้ใส่</b>ชิ้น ${i} ขึ้นไปแถวบน` });
      else {
        picked.push(i);
        fr.push({ path: path.slice(), cur: [i, j], up: [i - 1, j], picked: picked.slice(), cap: `F(${i},${j}) = ${F[i][j]} ≠ ช่องบน ${F[i - 1][j]} → <b>ใส่</b>ชิ้น ${i} แล้วลด j ลง ${items[i - 1].w} เหลือ ${j - items[i - 1].w}` });
        j -= items[i - 1].w;
      }
    }
    const tw = picked.reduce((s, i) => s + items[i - 1].w, 0), tv = picked.reduce((s, i) => s + items[i - 1].v, 0);
    fr.push({ path: path.slice(), picked: picked.slice(), done: true, cap: `ได้ชิ้น {${picked.slice().reverse().join(', ')}} · น้ำหนัก ${tw} · มูลค่า <b>${tv}</b>` });
    return { F, fr };
  }

  function drawTable(el, items, W, F, f, mode) {
    const n = items.length;
    const has = (arr, i, j) => arr && arr[0] === i && arr[1] === j;
    const inPath = (i, j) => f.path && f.path.some((p) => p[0] === i && p[1] === j);
    let h = `<div class="scroll"><table class="kt"><tr><th></th>${Array.from({ length: W + 1 }, (_, j) => `<th>j=${j}</th>`).join('')}</tr>`;
    for (let i = 0; i <= n; i++) {
      const it = items[i - 1];
      h += `<tr><th class="rowh">${i === 0 ? 'ไม่มีของ' : `ชิ้น ${i}<small>w=${it.w}, v=${it.v}</small>`}</th>`;
      for (let j = 0; j <= W; j++) {
        let cls = '', val = F[i][j];
        if (mode === 'fill') {
          const [ui, uj] = f.upto;
          const shown = i === 0 || j === 0 || i < ui || (i === ui && j <= uj);
          if (!shown) cls = 'empty';
          else if (i === 0 || j === 0) cls = 'base';
          if (has(f.cur, i, j)) cls = 'cur';
          else if (has(f.up, i, j)) cls = 'up';
          else if (has(f.dg, i, j)) cls = 'dg';
          if (f.done && i === n && j === W) cls = 'cur';
        } else {
          if (i === 0 || j === 0) cls = 'base';
          if (inPath(i, j)) cls = 'path';
          if (has(f.cur, i, j)) cls = 'cur';
          else if (has(f.up, i, j)) cls = 'up';
        }
        h += `<td class="${cls}">${cls === 'empty' ? '' : val}</td>`;
      }
      h += '</tr>';
    }
    h += '</table></div>';
    if (mode === 'fill') h += `<div class="legend"><span><i style="background:var(--acc)"></i>ช่องที่กำลังเติม</span><span><i style="background:var(--skip)"></i>ไม่ใส่ = ช่องบน</span><span><i style="background:var(--take)"></i>ใส่ = แถวบน ถอยซ้าย wᵢ</span></div>`;
    else h += `<div class="chosen">${(f.picked || []).map((i) => `<span>ชิ้น ${i}</span>`).join('') || '<span style="background:var(--surface-2);color:var(--ink-3)">ยังไม่ได้เลือก</span>'}</div>`;
    el.innerHTML = h;
  }

  function mountFill(slot, items, W, speed = 700) {
    const stage = document.createElement('div');
    stage.className = 'stage';
    slot.append(stage);
    const { F, fr } = fillFrames(items, W);
    Lab.stepper(stage, { frames: fr, speed, render(el, f) { drawTable(el, items, W, F, f, 'fill'); return f.cap; } });
  }
  function mountBack(slot, items, W) {
    const stage = document.createElement('div');
    stage.className = 'stage';
    slot.append(stage);
    const { F, fr } = backFrames(items, W);
    Lab.stepper(stage, { frames: fr, speed: 1300, render(el, f) { drawTable(el, items, W, F, f, 'back'); return f.cap; } });
  }

  function mountBag(slot, items, W) {
    const best = solve(items, W).F[items.length][W];
    const stage = document.createElement('div');
    stage.className = 'stage';
    stage.innerHTML = `<div class="items">${items.map((it, n) => `<button class="item" data-n="${n}" style="--ic:${COLORS[n]}">
        <span class="nm">ชิ้น ${n + 1}<small>w = ${it.w}</small></span>
        <span class="wt">${'<i></i>'.repeat(it.w)}</span><span class="val">${it.v}</span></button>`).join('')}</div>
      <div class="bag"><div class="slots"></div><div class="bagv"><b class="tv">0</b><span class="tw"></span></div><div class="bagmsg"></div></div>`;
    slot.append(stage);
    const sel = new Set(), tried = new Set();
    function draw() {
      const list = [...sel].sort();
      const tw = list.reduce((s, n) => s + items[n].w, 0), tv = list.reduce((s, n) => s + items[n].v, 0);
      const slots = stage.querySelector('.slots');
      let cells = [];
      list.forEach((n) => { for (let k = 0; k < items[n].w; k++) cells.push(COLORS[n]); });
      const total = Math.max(W, cells.length);
      slots.innerHTML = Array.from({ length: total }, (_, k) => k >= W ? '<i class="x"></i>' : `<i style="${cells[k] ? `background:${cells[k]}` : ''}"></i>`).join('');
      slots.classList.toggle('over', tw > W);
      stage.querySelectorAll('.item').forEach((b) => b.classList.toggle('in', sel.has(+b.dataset.n)));
      stage.querySelector('.tv').textContent = tw > W ? '—' : tv;
      stage.querySelector('.tw').textContent = `น้ำหนัก ${tw} / ${W}`;
      if (tw <= W) tried.add(list.join(','));
      const msg = stage.querySelector('.bagmsg');
      if (tw > W) msg.innerHTML = `<span style="color:var(--bad);font-weight:600">หนักเกิน ${tw - W}</span> เอาบางชิ้นออก`;
      else if (tv === best) msg.innerHTML = `<b style="color:var(--ok)">นี่คือค่ามากสุดแล้ว (${best})</b> · ของ ${items.length} ชิ้นมีให้ลอง 2<sup>${items.length}</sup> = ${2 ** items.length} แบบ ถ้ามี 40 ชิ้นจะเป็นประมาณ 1.1 ล้านล้านแบบ จึงต้องมีวิธีที่ไม่ต้องลองทุกแบบ`;
      else msg.innerHTML = `แตะของเพื่อใส่/เอาออก · ลองมาแล้ว ${tried.size} แบบ · หาชุดที่มูลค่ามากที่สุด`;
    }
    stage.addEventListener('click', (e) => { const b = e.target.closest('.item'); if (!b) return; const n = +b.dataset.n; sel.has(n) ? sel.delete(n) : sel.add(n); draw(); });
    draw();
  }

  const ITEMS = [{ w: 2, v: 12 }, { w: 1, v: 10 }, { w: 3, v: 20 }, { w: 2, v: 15 }];

  Lab.register({
    id: 'knapsack', ch: 'dp', title: '0/1 Knapsack', sub: 'ใส่ของลงเป้ให้มูลค่ามากที่สุด โดยถามทีละชิ้น', minutes: 10, checks: 4, slide: 'week8 หน้า 35–47',
    mount(root) {
      const L = 'knapsack';
      let s = Lab.beat(root, {
        kick: 'โจทย์',
        title: 'เป้จุได้ 5 · ของ 4 ชิ้น',
        html: `<p>แต่ละชิ้นมีน้ำหนัก w และมูลค่า v แต่ละชิ้น<b>เลือกได้ครั้งเดียว</b> (ใส่หรือไม่ใส่ แบ่งครึ่งไม่ได้) ลองจัดเองก่อน</p>`,
      });
      mountBag(s, ITEMS, 5);

      s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'ถามทีละชิ้น: ใส่ หรือ ไม่ใส่',
        html: `<p>ให้ <b>F(i, j)</b> = มูลค่ามากสุด ถ้าใช้ได้แค่ <b>i ชิ้นแรก</b> และเป้จุ <b>j</b> พอถึงชิ้นที่ i มีแค่สองทาง</p>
          <div class="rule"><span class="lbl">ถ้าชิ้น i ใส่ได้ (wᵢ ≤ j)</span>F(i, j) = max( ${K('F(i−1, j)', 'skip')} , ${K('vᵢ + F(i−1, j−wᵢ)', 'take')} )
          <span class="lbl" style="margin-top:10px">ถ้าใส่ไม่ได้ (wᵢ &gt; j)</span>F(i, j) = ${K('F(i−1, j)', 'skip')}
          <span class="lbl" style="margin-top:10px">เริ่มต้น</span>F(0, j) = 0 · F(i, 0) = 0</div>
          <p>${K('ไม่ใส่', 'skip')} ก็เหมือนชิ้นนี้ไม่มีอยู่ ใช้คำตอบของแถวบน ${K('ใส่', 'take')} ได้ vᵢ แล้วเป้เหลือที่ j − wᵢ ซึ่งแถวบนคิดไว้ให้แล้ว</p>`,
      });

      s = Lab.beat(root, {
        kick: 'ดูมันทำงาน',
        title: 'เติมตารางทีละช่อง',
        html: `<p>ทุกช่องดูแค่ <b>2 ช่องในแถวบน</b> เท่านั้น สีฟ้าคือไม่ใส่ สีส้มคือใส่</p>`,
        wide: true,
      });
      mountFill(s, ITEMS, 5);
      const c1 = Lab.beat(root, {});
      Lab.check(c1, { lesson: L, key: 'c1', q: `ช่อง F(3,4) มาจากอะไร (ชิ้น 3: w=3, v=20)`, options: ['F(2,4) = 22', '20 + F(2,1) = 30', '20 + F(2,4) = 42', 'F(3,3) = 22'], answer: 1,
        why: 'max( ไม่ใส่ F(2,4)=22 , ใส่ 20 + F(2,1)=10 → 30 ) = 30 · ตัวเลือก 42 ผิดเพราะต้องถอยซ้ายไป j − w = 1 ไม่ใช่อยู่ที่คอลัมน์เดิม' });

      s = Lab.beat(root, {
        kick: 'ย้อนรอย',
        title: 'รู้แล้วว่าได้ 37 แล้วเลือกชิ้นไหนบ้าง',
        html: `<p>เริ่มที่มุมขวาล่าง เทียบกับช่อง<b>บน</b> ถ้าเท่ากัน แปลว่าไม่ได้ใส่ชิ้นนี้ ถ้าไม่เท่า แปลว่าใส่ แล้วถอยซ้ายไป wᵢ ช่อง</p>`,
        wide: true,
      });
      mountBack(s, ITEMS, 5);
      const c2 = Lab.beat(root, {});
      Lab.check(c2, { lesson: L, key: 'c2', q: 'ในตาราง ถ้า F(4,5) = 37 แต่ F(3,5) = 32 แปลว่าอะไร', options: ['ชิ้น 4 ไม่ถูกเลือก', 'ชิ้น 4 ถูกเลือก', 'ชิ้น 3 ถูกเลือก', 'ยังบอกไม่ได้'], answer: 1,
        why: 'ค่าเปลี่ยนจากแถวบน แปลว่าการใส่ชิ้น 4 ทำให้ดีขึ้น' });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean">
          <li><b>ดูแถว i−1 เสมอ</b> ทั้งสองทาง ถ้าเผลอดูแถวเดียวกัน จะกลายเป็นหยิบชิ้นเดิมซ้ำได้ (นั่นคือ unbounded knapsack ใน lab ข้อ 8)</li>
          <li><b>ใส่ได้เมื่อ wᵢ ≤ j</b> และตอนใส่ต้องถอยไปคอลัมน์ ${K('j − wᵢ')} ไม่ใช่คอลัมน์ j</li>
          <li><b>Memory function</b> คือเขียนแบบ recursive แล้วจดลงตาราง คิดเฉพาะช่องที่ต้องใช้ (ตัวอย่างนี้ 11 จาก 20 ช่อง) แต่ worst case ยังเป็น ${K('Θ(nW)')}</li>
          <li><b>ตัดแบ่งของได้</b> (fractional) ไม่ต้องใช้ DP เลือกตาม v/w แบบ greedy ได้เลย</li></ul>`,
      });

      s = Lab.beat(root, {
        kick: 'ลองเอง',
        title: 'เปลี่ยนน้ำหนัก มูลค่า และขนาดเป้',
        wide: true,
      });
      const f = document.createElement('div');
      f.className = 'fields';
      f.innerHTML = ITEMS.map((it, n) => `<label class="field">ชิ้น ${n + 1} · w, v<span style="display:flex;gap:6px"><input id="kw${n}" type="number" min="1" max="6" value="${it.w}"><input id="kv${n}" type="number" min="1" max="99" value="${it.v}"></span></label>`).join('') +
        `<label class="field" style="flex:0 1 120px">W (เป้จุ)<input id="kW" type="number" min="1" max="8" value="5"></label>`;
      s.append(f);
      const host = document.createElement('div');
      s.append(host);
      const rebuild = () => {
        const clamp = (v, a, b) => Math.max(a, Math.min(b, Math.round(+v) || a));
        const items = ITEMS.map((_, n) => ({ w: clamp(f.querySelector('#kw' + n).value, 1, 6), v: clamp(f.querySelector('#kv' + n).value, 1, 99) }));
        const W = clamp(f.querySelector('#kW').value, 1, 8);
        host.innerHTML = '';
        mountFill(host, items, W, 450);
      };
      f.addEventListener('change', rebuild);
      rebuild();

      s = Lab.beat(root, { kick: 'ข้อสอบจำลอง', title: 'แบบที่ออกบ่อย' });
      Lab.check(s, { lesson: L, key: 'c3', label: 'ข้อ 1', q: 'ประสิทธิภาพของ knapsack แบบ DP (n ชิ้น เป้จุ W)', options: ['Θ(n)', 'Θ(n log n)', 'Θ(nW)', 'Θ(2ⁿ)'], answer: 2,
        why: 'ตารางมี (n+1)×(W+1) ช่อง แต่ละช่องใช้เวลาคงที่ · Θ(2ⁿ) คือการลองทุกชุดแบบ brute force' });
      const gap = document.createElement('div'); gap.style.height = '14px'; s.append(gap);
      Lab.check(s, { lesson: L, key: 'c4', label: 'ข้อ 2', q: `ของ (v, w) = (60, 10) (100, 20) (120, 30) เป้จุ 50 แบบ 0/1 ถ้าเลือกตาม v/w มากสุดก่อนได้มูลค่าเท่าไร และคำตอบจริงคือเท่าไร`, options: ['160 และ 220', '220 และ 220', '240 และ 220', '160 และ 160'], answer: 0,
        why: 'v/w = 6, 5, 4 → หยิบ 60 กับ 100 (หนัก 30) เหลือที่ 20 ใส่ชิ้น 120 ไม่ได้ = 160 · DP ได้ 100 + 120 = 220 · ส่วน 240 คือคำตอบของแบบ fractional' });

      s = Lab.beat(root, {});
      s.innerHTML = `<div class="recap"><h2>สรุป 3 บรรทัด</h2><ol>
        <li>F(i, j) = max( ไม่ใส่ F(i−1, j) , ใส่ vᵢ + F(i−1, j−wᵢ) )</li>
        <li>คำตอบที่มุมขวาล่าง · ย้อนรอย: ค่าไม่เท่าช่องบน → ใส่ แล้วถอยซ้าย wᵢ</li>
        <li>เวลาและ memory ${Lab.k('Θ(nW)')}</li></ol></div>`;
    },
  });
})();
