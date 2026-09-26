/* Lesson: Kruskal's algorithm (MST) */
(function () {
  const K = Lab.k;
  const COLORS = ['#0C9A83', '#4A52E0', '#C23F8A', '#8A6D1F', '#2A86E8'];
  const key = (u, v) => [u, v].sort().join('');

  function frames(G) {
    const V = Object.keys(G.pos);
    const order = G.E.slice().sort((a, b) => a[2] - b[2]);
    const parent = Object.fromEntries(V.map((v) => [v, v]));
    const find = (x) => { while (parent[x] !== x) x = parent[x]; return x; };
    const status = {}, tree = [];
    let total = 0;
    const comps = () => {
      const groups = {};
      for (const v of V) (groups[find(v)] = groups[find(v)] || []).push(v);
      const col = {};
      let c = 0;
      for (const g of Object.values(groups)) if (g.length > 1) { for (const v of g) col[v] = COLORS[c % COLORS.length]; c++; }
      return col;
    };
    const fr = [];
    const snap = (o) => Object.assign({ status: { ...status }, tree: tree.slice(), col: comps(), total, order }, o);
    fr.push(snap({ cap: `เรียง edge จากเบาไปหนัก แล้วหยิบทีละเส้น · ตอนนี้ทุกจุดยังแยกกันอยู่ (ป่า ${V.length} ต้น)` }));
    for (const [u, v, w] of order) {
      if (tree.length === V.length - 1) break;
      const k = key(u, v);
      if (find(u) !== find(v)) {
        parent[find(u)] = find(v); tree.push(k); status[k] = 'on'; total += w;
        fr.push(snap({ now: k, ok: true, cap: `${K(u + v + ' (' + w + ')', 'ok')} ต่อสองกลุ่มที่แยกกัน → <b>รับ</b> · รวม ${total}` }));
      } else {
        status[k] = 'no';
        fr.push(snap({ now: k, ok: false, cap: `${K(u + v + ' (' + w + ')', 'bad')} ${u} กับ ${v} อยู่กลุ่มสีเดียวกันแล้ว ใส่ไปจะเกิด<b>วงจร</b> → ข้าม` }));
      }
    }
    fr.push(snap({ done: true, cap: `ได้ ${V.length - 1} edge แล้วหยุด (ไม่ต้องดูเส้นที่เหลือ) · น้ำหนักรวม MST = <b>${total}</b>` }));
    return fr;
  }

  function mount(slot, G) {
    Lab.stepper(Lab.stage(slot), {
      frames: frames(G), speed: 1300,
      render(el, f) {
        const svg = Lab.graph(G, {
          w: 600, h: 330,
          edgeCls: (u, v) => { const k = key(u, v); if (f.now === k) return f.ok ? 'ok' : 'bad'; return f.tree.includes(k) ? 'tree' : f.status[k] === 'no' ? 'dim' : ''; },
          nodeFill: (v) => f.col[v] || null,
        });
        const list = f.order.map(([u, v, w]) => { const k = key(u, v); const cls = f.now === k ? 'now' : f.status[k] || ''; return `<span class="${cls}">${u}${v} ${w}</span>`; }).join('');
        el.innerHTML = `<div class="dgrid"><div>${svg}</div><div><div class="mini-h">edge เรียงตามน้ำหนัก</div><div class="pillrow" style="margin-top:0">${list}</div><div class="calc">รวมตอนนี้ = <b>${f.total}</b> · สีเดียวกัน = ต้นเดียวกัน</div></div></div>`;
        return f.cap;
      },
    });
  }

  Lab.register({
    id: 'kruskal', ch: 'gr', title: 'Kruskal', sub: 'MST แบบเรียง edge แล้วหยิบเส้นที่ไม่ทำให้เกิดวงจร', minutes: 7, checks: 3, slide: 'week9 หน้า 21–29',
    mount(root) {
      const L = 'kruskal';
      const G = Lab.MSTG;
      let s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'หยิบ edge ที่ถูกที่สุดก่อน',
        html: `<p>เรียง edge ทั้งกราฟจากน้อยไปมาก แล้วหยิบทีละเส้น ถ้าเส้นนั้นเชื่อมจุดที่<b>ยังไม่ถึงกัน</b>ก็รับ ถ้าเชื่อมจุดที่ถึงกันอยู่แล้วจะเกิดวงจร ให้ข้าม หยุดเมื่อได้ |V| − 1 เส้น</p>
          <p>ระหว่างทางจะเป็น<b>ป่า</b>หลายต้น (สีต่างกัน) แล้วค่อย ๆ รวมเป็นต้นเดียว การเช็กว่าอยู่กลุ่มเดียวกันไหมใช้ <b>union-find</b></p>`,
      });
      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'กราฟเดียวกับบท Prim', html: `<p>เส้นเขียว = รับ · เส้นแดงประ = ข้ามเพราะเกิดวงจร</p>`, wide: true });
      mount(s, G);
      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'edge แรกที่ Kruskal ข้ามเพราะเกิดวงจรคือ', options: ['bf (4)', 'cf (4)', 'af (5)', 'df (5)'], answer: 1, why: 'หลังรับ bc, ef, ab, bf แล้ว c กับ f อยู่กลุ่มเดียวกัน → cf ทำให้เกิดวงจร' });

      s = Lab.beat(root, {
        kick: 'เทียบ',
        title: 'Prim กับ Kruskal',
        html: `<div class="scroll"><table class="dt" style="min-width:460px"><tr><th></th><th>Prim</th><th>Kruskal</th></tr>
          <tr><td>หยิบทีละ</td><td>จุด (ผ่าน edge ที่เบาสุดจากต้นไม้)</td><td>edge (เบาสุดทั้งกราฟที่ไม่เกิดวงจร)</td></tr>
          <tr><td>ระหว่างทาง</td><td>ต้นไม้ต้นเดียวเสมอ</td><td>ป่าหลายต้น</td></tr>
          <tr><td>ใช้ช่วย</td><td>priority queue</td><td>sort + union-find</td></tr>
          <tr><td>เวลา</td><td>O(|E| log |V|)</td><td>O(|E| log |E|)</td></tr>
          <tr><td>ผลลัพธ์</td><td colspan="2">MST น้ำหนักรวมเท่ากัน (ตัวอย่างนี้ 15)</td></tr></table></div>`,
      });
      Lab.exam(root, L, [
        { key: 'c2', q: 'เวลาส่วนใหญ่ของ Kruskal อยู่ที่', options: ['การเรียง edge', 'การตรวจวงจร', 'การสร้าง adjacency matrix', 'การหาจุดที่ใกล้ที่สุด'], answer: 0, why: 'sort ใช้ O(|E| log |E|) ส่วน union-find เร็วมาก' },
        { key: 'c3', q: 'ข้อใดถูกเกี่ยวกับ Kruskal ระหว่างทำงาน', options: ['เป็นต้นไม้ต้นเดียวเสมอ', 'อาจเป็นป่าหลายต้น', 'ต้องเริ่มจากจุด a', 'ใช้ได้กับ edge ที่ไม่ติดลบเท่านั้น'], answer: 1, why: 'หยิบ edge จากตรงไหนก็ได้ในกราฟ จึงเกิดหลายต้นก่อนรวมกัน' },
      ]);
      Lab.recap(root, [
        'เรียง edge → หยิบทีละเส้น → ข้ามเส้นที่ทำให้เกิดวงจร',
        'หยุดเมื่อได้ |V| − 1 edge',
        'O(|E| log |E|) ส่วนใหญ่คือการ sort',
      ]);
    },
  });
})();
