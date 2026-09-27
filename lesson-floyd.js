/* Lesson: Warshall & Floyd */
(function () {
  const K = Lab.k;
  const INF = Infinity;
  const V = ['a', 'b', 'c', 'd'];
  const POS = { a: [70, 55], b: [290, 55], c: [70, 235], d: [290, 235] };
  const GW = { directed: true, pos: POS, E: [['a', 'b', null], ['b', 'd', null], ['d', 'a', null], ['d', 'c', null]] };
  const GF = { directed: true, pos: POS, E: [['a', 'c', 3], ['b', 'a', 2], ['c', 'b', 7], ['c', 'd', 1], ['d', 'a', 6]] };

  function matrixOf(G, warsh) {
    const M = V.map((u) => V.map((v) => (warsh ? 0 : u === v ? 0 : INF)));
    for (const [u, v, w] of G.E) M[V.indexOf(u)][V.indexOf(v)] = warsh ? 1 : w;
    return M;
  }

  function frames(warsh) {
    let M = matrixOf(warsh ? GW : GF, warsh);
    const fr = [{ M: M.map((r) => r.slice()), cap: warsh ? 'R⁽⁰⁾ = adjacency matrix · 1 ถ้ามี edge ตรง i → j' : 'D⁽⁰⁾ = weight matrix · ไม่มี edge = ∞' }];
    for (let k = 0; k < 4; k++) {
      const N = M.map((r) => r.slice()), chg = [];
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          if (warsh) {
            if (!M[i][j] && M[i][k] && M[k][j]) { N[i][j] = 1; chg.push([i, j, `R[${V[i]},${V[j]}] = R[${V[i]},${V[k]}] and R[${V[k]},${V[j]}] = 1 and 1 = 1 (${V[i]}→${V[k]}→${V[j]})`]); }
          } else {
            const via = M[i][k] + M[k][j];
            if (via < M[i][j]) { N[i][j] = via; chg.push([i, j, `D[${V[i]},${V[j]}] = D[${V[i]},${V[k]}] + D[${V[k]},${V[j]}] = ${Lab.fmt(M[i][k])} + ${Lab.fmt(M[k][j])} = ${via}${M[i][j] === INF ? '' : ` (แทน ${Lab.fmt(M[i][j])})`}`]); }
          }
        }
      M = N;
      const lab = warsh ? `R⁽${k + 1}⁾` : `D⁽${k + 1}⁾`;
      fr.push({ M: M.map((r) => r.slice()), k, chg: chg.map((c) => [c[0], c[1]]),
        cap: `${lab} · ให้ ${K(V[k], 'hi')} เป็นจุดแวะได้ → ${chg.length ? chg.map((c) => `<b>${c[2]}</b>`).join(' · ') : 'ไม่มีช่องไหนเปลี่ยน'}` });
    }
    fr.push({ M, done: true, cap: warsh ? 'R⁽⁴⁾ = transitive closure · 1 = เดินไปถึงได้ (ผ่านกี่จุดก็ได้)' : 'D⁽⁴⁾ = ระยะสั้นสุดของทุกคู่' });
    return fr;
  }

  function mat(M, f, name) {
    const has = (i, j) => f.chg && f.chg.some((c) => c[0] === i && c[1] === j);
    let h = `<table class="kt"><tr><th>${name}</th>${V.map((v) => `<th>${v}</th>`).join('')}</tr>`;
    M.forEach((row, i) => {
      h += `<tr><th class="rowh">${V[i]}</th>${row.map((x, j) => {
        let cls = '';
        if (has(i, j)) cls = 'path';
        else if (f.k != null && (i === f.k || j === f.k)) cls = 'up';
        return `<td class="${cls}">${Lab.fmt(x)}</td>`;
      }).join('')}</tr>`;
    });
    return h + '</table>';
  }

  Lab.register({
    id: 'floyd', ch: 'dp', title: 'Warshall & Floyd', sub: 'เพิ่มจุดแวะทีละจุด ได้คำตอบของทุกคู่', minutes: 9, checks: 4, slide: 'week8 หน้า 61–82',
    mount(root) {
      const L = 'floyd';
      let s = Lab.beat(root, {
        kick: 'ไอเดีย',
        title: 'อนุญาตจุดแวะเพิ่มทีละจุด',
        html: `<p>รอบ k ถามทุกคู่ (i, j) ว่า "ถ้าให้แวะที่ k ได้ ดีขึ้นไหม" ทางใหม่คือ i → k แล้ว k → j ซึ่งสองช่วงนี้รู้คำตอบจากรอบก่อนแล้ว</p>
          <div class="rule"><span class="lbl">Warshall · ไปถึงกันได้ไหม (0/1)</span>R⁽ᵏ⁾[i, j] = R⁽ᵏ⁻¹⁾[i, j] <b>or</b> ( R⁽ᵏ⁻¹⁾[i, k] <b>and</b> R⁽ᵏ⁻¹⁾[k, j] )
          <span class="lbl" style="margin-top:8px">Floyd · ระยะสั้นสุดเท่าไร</span>D⁽ᵏ⁾[i, j] = <b>min</b>( D⁽ᵏ⁻¹⁾[i, j] , D⁽ᵏ⁻¹⁾[i, k] <b>+</b> D⁽ᵏ⁻¹⁾[k, j] )</div>
          <p>โค้ดเหมือนกันทุกบรรทัด 3 ลูปซ้อน k → i → j ต่างกันแค่ or/and กับ min/+</p>`,
      });

      s = Lab.beat(root, { kick: 'ดูมันทำงาน', title: 'ตัวอย่างจากสไลด์', html: `<p>กรอบฟ้า = แถวและคอลัมน์ของ k (รอบนั้นไม่เปลี่ยน) · ช่องเหลือง = ค่าที่เพิ่งเปลี่ยน</p>`, wide: true });
      const bar = document.createElement('div');
      bar.style.marginBottom = '12px';
      bar.innerHTML = `<div class="seg"><button class="on" data-m="w">Warshall</button><button data-m="f">Floyd</button></div>`;
      s.append(bar);
      const host = document.createElement('div');
      s.append(host);
      let warsh = true;
      const build = () => {
        host.innerHTML = '';
        const G = warsh ? GW : GF;
        Lab.stepper(Lab.stage(host), {
          frames: frames(warsh), speed: 1900,
          render(el, f) {
            const name = warsh ? (f.k == null ? (f.done ? 'R⁽⁴⁾' : 'R⁽⁰⁾') : `R⁽${f.k + 1}⁾`) : f.k == null ? (f.done ? 'D⁽⁴⁾' : 'D⁽⁰⁾') : `D⁽${f.k + 1}⁾`;
            el.innerHTML = `<div class="dgrid"><div>${Lab.graph(G, { w: 360, h: 290, maxw: 380, wPos: (u, v) => ((u === 'c' && v === 'b') || (u === 'd' && v === 'a') ? 0.28 : 0.5), nodeCls: (v) => (f.k != null && V[f.k] === v ? 'hi' : '') })}</div><div class="scroll">${mat(f.M, f, name)}</div></div>`;
            return f.cap;
          },
        });
      };
      bar.addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (!b) return; warsh = b.dataset.m === 'w'; bar.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); build(); });
      build();

      s = Lab.beat(root, {});
      Lab.check(s, { lesson: L, key: 'c1', q: 'Floyd: D⁽ᵏ⁻¹⁾[i, j] = ∞, D⁽ᵏ⁻¹⁾[i, k] = 3, D⁽ᵏ⁻¹⁾[k, j] = 1 → D⁽ᵏ⁾[i, j] =', options: ['∞', '1', '3', '4'], answer: 3, why: 'min(∞, 3 + 1) = 4 เหมือน a → c → d ในตัวอย่าง' });

      s = Lab.beat(root, {
        kick: 'ทำด้วยมือเร็ว ๆ',
        title: 'Warshall รอบ k ในข้อสอบ',
        html: `<ul class="clean"><li>ดู<b>คอลัมน์ k</b> หาแถว i ที่เป็น 1 (i ไปถึง k ได้)</li>
          <li>เอา<b>แถว k</b> ไป OR ใส่แถว i นั้น (k ไปถึงที่ไหน i ก็ไปถึงที่นั่น)</li>
          <li>แถว k และคอลัมน์ k ไม่เปลี่ยนในรอบ k</li></ul>`,
      });

      s = Lab.beat(root, {
        kick: 'ระวัง',
        title: 'จุดที่คนตอบผิดบ่อย',
        html: `<ul class="clean"><li>ช่องใน D⁽ᵏ⁾ ต้องใช้ค่าจาก <b>D⁽ᵏ⁻¹⁾</b> (ตารางก่อนหน้า)</li>
          <li>∞ + อะไรก็ = ∞</li>
          <li>Floyd ใช้กับ edge ติดลบได้ แต่<b>ห้ามมี negative cycle</b> (ถ้าจบแล้ว D[i][i] &lt; 0 แปลว่ามี)</li>
          <li>R[a][a] = 1 ได้ก็ต่อเมื่อมี cycle ผ่าน a · แถวของจุดที่ไม่มี edge ออก (c) เป็น 0 ทั้งหมด</li>
          <li>ทั้งคู่ใช้เวลา ${K('Θ(n³)')} memory ${K('Θ(n²)')}</li></ul>`,
      });
      Lab.exam(root, L, [
        { key: 'c2', q: 'Warshall: R⁽ᵏ⁾[i, j] = 1 เมื่อ', options: ['R⁽ᵏ⁻¹⁾[i, j] = 1 และ R⁽ᵏ⁻¹⁾[k, j] = 1', 'R⁽ᵏ⁻¹⁾[i, j] = 1 หรือ (R⁽ᵏ⁻¹⁾[i, k] = 1 และ R⁽ᵏ⁻¹⁾[k, j] = 1)', 'R⁽ᵏ⁻¹⁾[i, k] = 1 หรือ R⁽ᵏ⁻¹⁾[k, j] = 1', 'R⁽ᵏ⁻¹⁾[k, k] = 1'], answer: 1, why: 'เดิมไปได้อยู่แล้ว หรือไป i→k และ k→j ได้' },
        { key: 'c3', q: 'Floyd ให้คำตอบผิดเมื่อกราฟ', options: ['มี edge ติดลบ', 'มี negative cycle', 'เป็น undirected', 'มีจุดเกิน 100 จุด'], answer: 1, why: 'วนรอบ negative cycle ได้ระยะลดลงเรื่อย ๆ · edge ลบอย่างเดียวยังใช้ได้' },
        { key: 'c4', q: 'ถ้ากราฟมี 100 จุด Floyd ทำงานประมาณกี่ครั้ง (lab ข้อ 20)', options: ['10,000', '100,000', '1,000,000', '100 log 100'], answer: 2, why: 'Θ(n³) = 100³ = 1,000,000' },
      ]);
      Lab.recap(root, [
        'รอบ k: ให้ k เป็นจุดแวะได้ ใช้ค่าจากตารางรอบ k−1',
        'Warshall: or + and · Floyd: min + บวก',
        'Θ(n³) · Floyd ห้ามมี negative cycle',
      ]);
    },
  });
})();
