/* Lesson: Dijkstra's algorithm */
(function () {
  const K = Lab.k;
  const INF = Infinity;
  const fmt = (d) => (d === INF ? '∞' : String(d));

  const G = {
    pos: { a: [50, 205], b: [170, 85], c: [400, 85], d: [290, 205], e: [510, 205] },
    E: [['a', 'b', 3], ['a', 'd', 7], ['b', 'c', 4], ['b', 'd', 2], ['c', 'd', 5], ['c', 'e', 6], ['d', 'e', 4]],
  };
  const labelBelow = (G, v) => G.pos[v][1] > 170;

  function run(G, s) {
    const V = Object.keys(G.pos);
    const adj = Object.fromEntries(V.map((v) => [v, []]));
    for (const [u, v, w] of G.E) { adj[u].push([v, w]); if (!G.directed) adj[v].push([u, w]); }
    for (const v of V) adj[v].sort((x, y) => V.indexOf(x[0]) - V.indexOf(y[0]));
    const dist = Object.fromEntries(V.map((v) => [v, INF])), prev = {}, done = [], F = [];
    dist[s] = 0;
    const snap = (o) => ({ dist: { ...dist }, prev: { ...prev }, done: done.slice(), ...o });
    F.push(snap({ cap: `ตั้ง d(${s}) = 0 · จุดอื่นยังไปไม่ถึง d = ∞` }));
    while (done.length < V.length) {
      let u = null;
      for (const v of V) if (!done.includes(v) && (u === null || dist[v] < dist[u])) u = v;
      if (dist[u] === INF) break;
      done.push(u);
      const rest = V.filter((v) => !done.includes(v) && dist[v] < INF).map((v) => `${v}(${dist[v]})`).join(', ');
      F.push(snap({ cur: u, cap: `จุดที่ยังไม่ปิดและ d น้อยที่สุดคือ ${K(u, 'acc')} (d = ${dist[u]}) → <b>ปิดถาวร</b>${rest ? ` <span class="muted">· ตัวอื่นที่รอ: ${rest}</span>` : ''}` }));
      for (const [v, w] of adj[u]) {
        if (done.includes(v)) continue;
        const nd = dist[u] + w, old = dist[v];
        if (nd < old) {
          dist[v] = nd; prev[v] = u;
          F.push(snap({ cur: u, edge: [u, v], chg: v, cap: `d(${v}) = d(${u}) + w(${u},${v}) = ${dist[u]} + ${w} = ${K(nd, 'hi')} < ${fmt(old)} → อัปเดต d(${v}) = ${nd}, มาจาก ${u}` }));
        } else {
          F.push(snap({ cur: u, edge: [u, v], cap: `d(${v}) = d(${u}) + w(${u},${v}) = ${dist[u]} + ${w} = ${nd} ไม่น้อยกว่า d(${v}) เดิม = ${old} → คงค่าเดิม` }));
        }
      }
    }
    F.push(snap({ final: true, cap: `ปิดครบทุกจุด · เส้นสีคือเส้นทางสั้นสุดจาก ${s} ไปทุกจุด` }));
    return F;
  }

  function svgGraph(G, f, opts = {}) {
    const V = Object.keys(G.pos);
    const w = opts.w || 560, h = opts.h || 290;
    const treeEdge = (u, v) => f.prev && (f.prev[v] === u || (!G.directed && f.prev[u] === v));
    const onPath = opts.path ? (u, v) => { for (let i = 0; i + 1 < opts.path.length; i++) { const a = opts.path[i], b = opts.path[i + 1]; if ((a === u && b === v) || (a === v && b === u)) return true; } return false; } : null;
    let s = `<svg class="gsvg" viewBox="0 0 ${w} ${h}" role="img" aria-label="กราฟ">`;
    if (G.directed) s += `<defs><marker id="ah${opts.id || ''}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink-3)"/></marker></defs>`;
    for (const [u, v, wt] of G.E) {
      const [x1, y1] = G.pos[u], [x2, y2] = G.pos[v];
      const isTry = f.edge && ((f.edge[0] === u && f.edge[1] === v) || (!G.directed && f.edge[0] === v && f.edge[1] === u));
      let cls = 'ed';
      if (onPath) cls += onPath(u, v) ? ' tree' : ' dim';
      else if (isTry) cls += ' try';
      else if (treeEdge(u, v)) cls += ' tree';
      let ex = x2, ey = y2;
      if (G.directed) { const L = Math.hypot(x2 - x1, y2 - y1); ex = x2 - ((x2 - x1) / L) * 27; ey = y2 - ((y2 - y1) / L) * 27; }
      s += `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}"${G.directed ? ` marker-end="url(#ah${opts.id || ''})"` : ''}/>`;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L = Math.hypot(x2 - x1, y2 - y1);
      const nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
      s += `<text class="wl" x="${mx + nx * 14}" y="${my + ny * 14 + 5}">${wt}</text>`;
    }
    for (const v of V) {
      const [x, y] = G.pos[v];
      let cls = 'nd';
      if (f.done && f.done.includes(v)) cls += ' done';
      else if (f.dist && f.dist[v] < INF) cls += ' front';
      if (f.cur === v && !f.final) cls += ' cur';
      if (opts.click) cls += ' click';
      s += `<g class="${cls}" data-v="${v}"><circle cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y}">${v}</text></g>`;
      if (f.dist && !opts.noDist) {
        const ly = labelBelow(G, v) ? y + 42 : y - 42;
        let dc = 'dl';
        if (f.chg === v) dc += ' chg'; else if (f.done && f.done.includes(v)) dc += ' fin';
        s += `<g class="${dc}"><rect x="${x - 22}" y="${ly - 13}" width="44" height="26" rx="8"/><text x="${x}" y="${ly}">${fmt(f.dist[v])}</text></g>`;
      }
    }
    return s + '</svg>';
  }

  function sideTable(G, f) {
    const V = Object.keys(G.pos);
    return `<table class="dt"><tr><th>จุด</th><th>d</th><th>มาจาก</th><th></th></tr>${V.map((v) => {
      const done = f.done.includes(v);
      const st = done ? 'ปิดแล้ว' : f.dist[v] < INF ? 'รอ' : 'ยังไม่เจอ';
      return `<tr class="${done ? 'done' : ''}"><td>${v}</td><td class="${f.chg === v ? 'chg' : ''}">${fmt(f.dist[v])}</td><td class="${f.chg === v ? 'chg' : ''}">${f.prev[v] || '–'}</td><td class="stt">${st}</td></tr>`;
    }).join('')}</table>`;
  }

  function mountRun(slot, G, s) {
    const stage = document.createElement('div');
    stage.className = 'stage';
    slot.append(stage);
    return Lab.stepper(stage, {
      frames: run(G, s),
      speed: 1300,
      render(el, f) {
        el.innerHTML = `<div class="dgrid"><div>${svgGraph(G, f)}</div><div>${sideTable(G, f)}
          <div class="legend"><span><i style="background:var(--acc)"></i>ปิดแล้ว</span><span><i style="background:var(--hi)"></i>กำลังพิจารณา</span><span><i style="border:2px solid var(--acc);background:transparent"></i>เจอแล้ว รอปิด</span></div></div></div>`;
        return f.cap;
      },
    });
  }

  function pathTo(prev, s, v) {
    const p = [v];
    while (p[0] !== s && prev[p[0]]) p.unshift(prev[p[0]]);
    return p[0] === s ? p : null;
  }

  function mountExplorer(slot) {
    const F = run(G, 'a'), f = F[F.length - 1];
    const stage = document.createElement('div');
    stage.className = 'stage';
    slot.append(stage);
    let target = 'e';
    const edgeW = (u, v) => { const e = G.E.find(([a, b]) => (a === u && b === v) || (!G.directed && a === v && b === u)); return e ? e[2] : 0; };
    const draw = () => {
      const p = pathTo(f.prev, 'a', target);
      const ws = p.slice(0, -1).map((u, i) => edgeW(u, p[i + 1]));
      stage.innerHTML = svgGraph(G, f, { path: p, click: true }) +
        `<div class="cap">d(${target}) = ${p.join(' → ')} = ${ws.join(' + ')} = <b>${f.dist[target]}</b> <span class="muted">· แตะจุดอื่นเพื่อดูเส้นทาง</span></div>`;
    };
    stage.addEventListener('click', (e) => { const g = e.target.closest('.nd'); if (!g || g.dataset.v === 'a') return; target = g.dataset.v; draw(); });
    draw();
  }

  function mountTwin(slot) {
    const T = { pos: { s: [50, 165], a: [230, 70], b: [230, 250] }, E: [['s', 'a', 2], ['s', 'b', 3], ['a', 'b', 2]] };
    const prim = { prev: { a: 's', b: 'a' } };
    const dj = run(T, 's');
    const dfin = dj[dj.length - 1];
    const stage = document.createElement('div');
    stage.className = 'stage';
    stage.innerHTML = `<div class="twin">
      <div class="pane"><h3>Prim</h3>${svgGraph(T, prim, { w: 290, h: 320, noDist: true })}<p>เลือก edge ที่<b>เบาที่สุด</b>ที่ต่อออกจากต้นไม้: s–a (2) แล้ว a–b (2) · รวม ${K('4', 'acc')}</p></div>
      <div class="pane"><h3>Dijkstra</h3>${svgGraph(T, { prev: dfin.prev, dist: dfin.dist, done: dfin.done }, { w: 290, h: 320 })}<p>เลือกจุดที่<b>ระยะรวมจาก s</b> น้อยสุด: b ไปตรงได้ 3 ถูกกว่าอ้อมผ่าน a = 2 + 2 = 4 จึงใช้ s–b</p></div></div>`;
    slot.append(stage);
  }

  function mountNeg(slot) {
    const N = { directed: true, pos: { s: [50, 165], a: [240, 70], b: [240, 250] }, E: [['s', 'a', 1], ['s', 'b', 2], ['b', 'a', -2]] };
    const F = run(N, 's'), f = F[F.length - 1];
    const stage = document.createElement('div');
    stage.className = 'stage';
    stage.innerHTML = `<div class="twin">
      <div class="pane"><h3>Dijkstra ตอบ d(a) = 1</h3>${svgGraph(N, f, { w: 300, h: 320, id: 'n1' })}<p>ปิด a ตั้งแต่รอบแรกด้วยระยะ 1 พอเจอ b→a ทีหลัง a ถูกปิดไปแล้ว</p></div>
      <div class="pane"><h3>คำตอบจริง d(a) = 0</h3>${svgGraph(N, { prev: { a: 'b', b: 's' }, dist: { s: 0, a: 0, b: 2 }, done: ['s', 'a', 'b'] }, { w: 300, h: 320, id: 'n2' })}<p>s → b → a = 2 + (−2) = 0 สั้นกว่า</p></div></div>`;
    slot.append(stage);
  }

  Lab.register({
    id: 'dijkstra', ch: 'gr', title: 'Dijkstra', sub: 'ระยะทางสั้นที่สุดจากจุดเดียวไปทุกจุด', minutes: 10, checks: 4, slide: 'week9 หน้า 30–38',
    mount(root) {
      const L = 'dijkstra';
      let s = Lab.beat(root, {
        kick: 'โจทย์',
        title: 'จาก a ไปทุกจุด ระยะสั้นสุดเท่าไร',
        html: `<p>ตัวเลขบนเส้นคือระยะทาง (ห้ามติดลบ) ลองเดาก่อนว่าจาก a ไป e สั้นสุดเท่าไร</p>`,
      });
      const pre = document.createElement('div');
      pre.className = 'stage';
      pre.innerHTML = svgGraph(G, {}, {});
      s.append(pre);
      const gap = (el) => { const d = document.createElement('div'); d.style.height = '14px'; el.append(d); };
      gap(s);
      Lab.check(s, { lesson: L, key: 'c1', label: 'ทายก่อน', q: 'ระยะสั้นสุดจาก a ไป e', options: ['9', '10', '11', '13'], answer: 0,
        why: 'a → b → d → e = 3 + 2 + 4 = 9 · ไปตรง a → d → e ได้ 11 · a → b → c → e ได้ 13' });

      s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'ปิดจุดที่ใกล้ที่สุดทีละจุด',
        html: `<p>แต่ละจุดมีป้าย <b>d</b> = ระยะที่ดีที่สุดเท่าที่รู้ตอนนี้ ทุกรอบทำ 2 อย่าง</p>
          <div class="rule"><span class="lbl">1. เลือก</span>จุดที่ยังไม่ปิดและ d น้อยที่สุด → ปิดถาวร (ไม่มีทางสั้นกว่านี้แล้ว)
          <span class="lbl" style="margin-top:10px">2. relax เพื่อนบ้าน</span>ถ้า d(u) + w(u, v) &lt; d(v) → d(v) ← d(u) + w(u, v), จำว่ามาจาก u</div>
          <p>ที่ปิดได้ถาวรก็เพราะน้ำหนักไม่ติดลบ ทางอื่นที่อ้อมไปมีแต่จะยาวขึ้น</p>`,
      });

      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'เริ่มจาก a', html: `<p>ป้ายเหนือหรือใต้จุดคือ d ช่องสีเหลืองคือค่าที่เพิ่งถูกอัปเดต ตารางด้านขวาเหมือนที่เขียนในข้อสอบ</p>`, wide: true });
      mountRun(s, G, 'a');
      const c2 = Lab.beat(root, {});
      Lab.check(c2, { lesson: L, key: 'c2', q: 'หลังปิด a และ b แล้ว จุดถัดไปที่ถูกปิดคือ', options: ['c (7)', 'd (7)', 'e (9)', 'd (5)'], answer: 3,
        why: 'หลังปิด b: d อัปเดตเป็น 3 + 2 = 5 และ c = 3 + 4 = 7 · ตัวที่น้อยที่สุดคือ d (5)' });

      s = Lab.beat(root, { kick: 'ผลลัพธ์', title: 'ได้เส้นทางไปทุกจุดพร้อมกัน', html: `<p>ช่อง "มาจาก" ในตารางพอให้ย้อนเส้นทางได้ แตะจุดไหนก็ได้</p>`, wide: true });
      mountExplorer(s);

      s = Lab.beat(root, {
        kick: 'เทียบ',
        title: 'Prim กับ Dijkstra โค้ดเกือบเหมือนกัน แต่ได้ต้นไม้คนละต้น',
        html: `<p>ทั้งคู่หยิบจุดทีละจุดเข้าต้นไม้ ต่างกันแค่ค่าที่ใช้เลือก Prim ใช้ ${K('w(u*, u)')} ส่วน Dijkstra ใช้ ${K('d(u*) + w(u*, u)')}</p>`,
        wide: true,
      });
      mountTwin(s);

      s = Lab.beat(root, { kick: 'ระวัง', title: 'ทำไมห้ามมี edge ติดลบ', wide: true });
      mountNeg(s);

      s = Lab.beat(root, {
        kick: 'ลองเอง',
        title: 'เปลี่ยนระยะทางหรือจุดเริ่ม',
        wide: true,
      });
      const f = document.createElement('div');
      f.innerHTML = `<div class="fields"><label class="field" style="flex:0 1 160px">จุดเริ่ม<select id="djS">${Object.keys(G.pos).map((v) => `<option>${v}</option>`).join('')}</select></label></div>
        <div class="wedit">${G.E.map(([u, v, w], n) => `<label>${u}–${v}<input id="djW${n}" type="number" min="0" max="20" value="${w}"></label>`).join('')}</div>`;
      s.append(f);
      const host = document.createElement('div');
      host.style.marginTop = '14px';
      s.append(host);
      const rebuild = () => {
        const E = G.E.map(([u, v, w], n) => [u, v, Math.max(0, Math.min(20, Math.round(+f.querySelector('#djW' + n).value) || 0))]);
        host.innerHTML = '';
        mountRun(host, { pos: G.pos, E }, f.querySelector('#djS').value);
      };
      f.addEventListener('change', rebuild);
      rebuild();

      s = Lab.beat(root, { kick: 'ข้อสอบจำลอง', title: 'แบบที่ออกบ่อย' });
      Lab.check(s, { lesson: L, key: 'c3', label: 'ข้อ 1', q: 'Dijkstra ที่ใช้ adjacency list + min-heap มีเวลาเท่าไร', options: ['Θ(|V|²)', 'O(|E| log |V|)', 'O(|V| + |E|)', 'Θ(|V|³)'], answer: 1,
        why: 'ดึง min |V| ครั้ง และลดค่าใน heap ไม่เกิน |E| ครั้ง ครั้งละ O(log |V|) · ถ้าใช้ matrix + array ธรรมดาจะเป็น Θ(|V|²)' });
      gap(s);
      Lab.check(s, { lesson: L, key: 'c4', label: 'ข้อ 2', q: 'ถ้าต้องการระยะสั้นสุด<b>ทุกคู่</b> ควรใช้อะไร', options: ['Dijkstra ครั้งเดียว', 'Prim', 'Floyd (หรือ Dijkstra |V| รอบ)', 'Kruskal'], answer: 2,
        why: 'Dijkstra ให้คำตอบจากจุดเริ่มจุดเดียว · Floyd เป็น DP ได้ทุกคู่ใน Θ(n³) · Prim และ Kruskal หา MST ไม่ใช่ระยะสั้นสุด' });

      s = Lab.beat(root, {});
      s.innerHTML = `<div class="recap"><h2>สรุป 3 บรรทัด</h2><ol>
        <li>ทุกรอบ: ปิดจุดที่ d น้อยสุด แล้ว relax เพื่อนบ้าน</li>
        <li>ต่างจาก Prim ตรงที่ใช้ระยะรวม d(u*) + w ไม่ใช่ w เดี่ยว ๆ</li>
        <li>น้ำหนักต้องไม่ติดลบ · ${Lab.k('O(|E| log |V|)')} ด้วย heap</li></ol></div>`;
    },
  });
})();
