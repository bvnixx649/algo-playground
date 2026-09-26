/* Lesson: 12 greedy problems from the lab */
(function () {
  const K = Lab.k;

  const PROBS = [
    { t: 'Coin Change', p: 'ทอน 68 บาทด้วยเหรียญ 20, 10, 5, 1 ให้ใช้เหรียญน้อยที่สุด',
      q: 'greedy ที่ถูกคือ', o: ['หยิบเหรียญเล็กสุดก่อน', 'หยิบเหรียญใหญ่สุดที่ยังไม่เกินยอดที่เหลือ', 'หยิบเหรียญที่ใช้บ่อยสุด', 'สุ่มเหรียญ'], a: 1,
      steps: ['68 ÷ 20 = 3 เหรียญ เหลือ 8', '8 ÷ 10 = 0', '8 ÷ 5 = 1 เหรียญ เหลือ 3', '3 ÷ 1 = 3 เหรียญ'], res: '{20: 3, 5: 1, 1: 3} รวม 7 เหรียญ', big: 'O(จำนวนชนิดเหรียญ)' },
    { t: 'Car Fueling', p: 'ทาง 950 km ถังวิ่งได้ 400 km ปั๊มอยู่ที่ 200, 375, 550, 750 เติมน้อยสุดกี่ครั้ง',
      q: 'ควรเติมที่ไหน', o: ['ทุกปั๊มที่ผ่าน', 'ปั๊มแรกที่เจอ', 'ปั๊มสุดท้ายที่ยังไปถึงก่อนน้ำมันหมด', 'ปั๊มที่อยู่กึ่งกลาง'], a: 2,
      steps: ['จาก 0 ไปได้ถึง 400 → ปั๊มสุดท้ายที่ถึงคือ 375 → เติม', 'จาก 375 ไปได้ถึง 775 → ปั๊มสุดท้ายที่ถึงคือ 750 → เติม', 'จาก 750 ไปได้ถึง 1150 ≥ 950 → ถึงแล้ว', 'ถ้าช่องว่างระหว่างปั๊มเกิน 400 ตอบ −1'], res: 'เติม 2 ครั้ง', big: 'O(n)' },
    { t: 'Social Distancing', p: 'ที่นั่งอยู่ที่ 1, 2, 4, 8, 9, 12 ต้องห่างกันอย่างน้อย 3 ให้คนนั่งได้มากที่สุด',
      q: 'greedy ที่ถูกคือ', o: ['นั่งที่แรกเสมอ แล้วเลือกที่ถัดไปที่ห่างจากคนล่าสุด ≥ K', 'เลือกที่ตรงกลางก่อน', 'นั่งทุกที่เว้นที่', 'นั่งที่สุดท้ายก่อน'], a: 0,
      steps: ['นั่ง 1', '2 ห่าง 1 ไม่ได้ · 4 ห่าง 3 ได้ → นั่ง 4', '8 ห่าง 4 ได้ → นั่ง 8', '9 ห่าง 1 ไม่ได้ · 12 ห่าง 4 ได้ → นั่ง 12'], res: '4 คน (1, 4, 8, 12)', big: 'O(n)',
      warn: 'เฉลยใน lab เขียนว่า 3 แต่ถ้ารันโค้ดเฉลยเองจะได้ 4 เพราะ 12 − 8 = 4 ≥ 3 นั่งได้' },
    { t: 'Box Packing', p: 'ของหนัก 3, 2, 2, 1, 4, 2 (ห้ามสลับลำดับ) กล่องรับได้ 5 ใช้กล่องน้อยสุดกี่ใบ',
      q: 'greedy ที่ถูกคือ', o: ['เรียงของจากหนักไปเบาก่อน', 'ใส่กล่องเดิมจนกว่าจะเกิน แล้วค่อยเปิดกล่องใหม่', 'ใส่กล่องละชิ้น', 'ใส่ของเบาก่อน'], a: 1,
      steps: ['[3, 2] = 5', '[2, 1] = 3 (ใส่ 4 แล้วเกิน)', '[4] (ใส่ 2 แล้วเกิน)', '[2]'], res: '4 กล่อง', big: 'O(n)' },
    { t: 'Activity Selection', p: 'งาน (เริ่ม, จบ) 8 งาน ห้องเดียว เลือกงานได้มากที่สุดโดยเวลาไม่ชนกัน',
      q: 'ต้องเรียงงานตาม', o: ['เวลาเริ่ม', 'ความยาวงาน', 'เวลาจบ', 'จำนวนงานที่ชน'], a: 2,
      steps: ['เรียงตามเวลาจบ: (1,4) (3,5) (0,6) (5,7) (3,8) (5,9) (6,10) (8,11)', 'เลือก (1,4) · (3,5) (0,6) เริ่มก่อน 4 ข้าม', 'เลือก (5,7) · (3,8) (5,9) (6,10) ชน ข้าม', 'เลือก (8,11)'], res: '3 งาน', big: 'O(n log n)', viz: 'act' },
    { t: 'Fractional Knapsack', p: 'ของ (มูลค่า, น้ำหนัก) = (60, 10) (100, 20) (120, 30) กระเป๋ารับ 50 ตัดแบ่งของได้',
      q: 'ต้องเรียงของตาม', o: ['มูลค่ามากก่อน', 'น้ำหนักน้อยก่อน', 'มูลค่าต่อน้ำหนัก (v/w) มากก่อน', 'ตามลำดับที่ให้มา'], a: 2,
      steps: ['v/w = 6, 5, 4', 'ใส่ (60, 10) ทั้งชิ้น เหลือที่ 40', 'ใส่ (100, 20) ทั้งชิ้น เหลือที่ 20', 'ตัด (120, 30) มา 20/30 ได้ 80'], res: '60 + 100 + 80 = 240', big: 'O(n log n)', viz: 'frac' },
    { t: 'Minimize Maximum Pair Sum', p: 'จับคู่ 3, 5, 2, 3, 4, 6 ให้ผลรวมคู่ที่มากที่สุดมีค่าน้อยที่สุด',
      q: 'greedy ที่ถูกคือ', o: ['จับคู่ที่อยู่ติดกัน', 'จับน้อยสุดกับมากสุด', 'จับมากสุดสองตัวด้วยกัน', 'สุ่ม'], a: 1,
      steps: ['เรียง: 2, 3, 3, 4, 5, 6', '(2, 6) = 8', '(3, 5) = 8', '(3, 4) = 7'], res: 'ค่ามากสุด = 8', big: 'O(n log n)' },
    { t: 'Connect Ropes', p: 'ต่อเชือกยาว 4, 3, 2, 6 เป็นเส้นเดียว ค่าต่อ = ผลรวมความยาวสองเส้นที่ต่อ',
      q: 'ควรต่อเส้นไหนก่อน', o: ['สองเส้นที่ยาวที่สุด', 'สองเส้นที่สั้นที่สุด (min-heap)', 'ตามลำดับที่ให้มา', 'ยาวสุดกับสั้นสุด'], a: 1,
      steps: ['2 + 3 = 5 → เหลือ 4, 5, 6', '4 + 5 = 9 → เหลือ 6, 9', '6 + 9 = 15', 'ค่าใช้จ่าย 5 + 9 + 15'], res: '29 (หลักการเดียวกับ Huffman)', big: 'O(n log n)',
      warn: 'test ที่ 2 ใน lab [1, 2, 5, 10, 35] เฉลยเขียน 85 แต่ที่ถูกคือ 3 + 8 + 18 + 53 = 82' },
    { t: 'Job Sequencing', p: 'งาน (ชื่อ, deadline, กำไร): A(2,100) B(1,19) C(2,27) D(1,25) E(3,15) งานละ 1 หน่วยเวลา',
      q: 'greedy ที่ถูกคือ', o: ['เรียงตาม deadline แล้ววางช่องแรกสุด', 'เรียงตามกำไรมากไปน้อย วางช่องที่ช้าที่สุดที่ยังไม่เกิน deadline', 'เรียงตามกำไรน้อยไปมาก', 'ทำงานที่ deadline ใกล้สุดก่อนเสมอ'], a: 1,
      steps: ['เรียงตามกำไร: A 100, C 27, D 25, B 19, E 15', 'A (dl 2) → ช่อง 2', 'C (dl 2) ช่อง 2 เต็ม → ช่อง 1', 'D, B (dl 1) ช่อง 1 เต็ม → ข้าม · E (dl 3) → ช่อง 3'], res: 'C, A, E กำไร 142', big: 'O(n²) หรือ O(n log n)' },
    { t: 'Minimum Stations', p: 'บ้านอยู่ที่ 1, 2, 3, 10, 14, 17 เสาครอบคลุมรัศมี 3 ใช้เสาน้อยที่สุดกี่ต้น',
      q: 'วางเสาที่ไหน', o: ['ที่บ้านหลังแรกที่ยังไม่มีสัญญาณ', 'ที่ตำแหน่ง บ้านหลังแรกที่ยังไม่มีสัญญาณ + R', 'ตรงกลางระหว่างบ้าน', 'ทุก ๆ 2R'], a: 1,
      steps: ['บ้าน 1 ยังไม่มีสัญญาณ → เสาที่ 4 คลุม 1…7', 'บ้าน 10 → เสาที่ 13 คลุม 10…16 (รวม 14)', 'บ้าน 17 → เสาที่ 20'], res: '3 ต้น', big: 'O(n log n)',
      warn: 'เฉลยใน lab เขียนว่า 2 แต่ 10 ถึง 17 ห่าง 7 มากกว่า 2R = 6 ต้องใช้ 3 ต้น' },
    { t: 'Minimum Platforms', p: 'รถไฟเข้า 900 940 950 1100 1500 1800 · ออก 910 1200 1120 1130 1900 2000 ต้องมีชานชาลากี่ช่อง',
      q: 'greedy ที่ถูกคือ', o: ['นับจำนวนรถไฟทั้งหมด', 'เรียงเวลาเข้าและออกแยกกัน เดินตามเวลา เข้า +1 ออก −1 ตอบค่าสูงสุด', 'เรียงตามเวลาออกอย่างเดียว', 'จับคู่เข้า-ออกที่ใกล้กัน'], a: 1,
      steps: ['900 เข้า 1 · 910 ออก 0', '940 เข้า 1 · 950 เข้า 2 · 1100 เข้า 3', '1120, 1130 ออก → 1 · 1200 ออก → 0', '1500 เข้า 1 · 1800 เข้า 2'], res: 'ค่าสูงสุด 3 ช่อง (ตอน 1100)', big: 'O(n log n)', viz: 'plat' },
    { t: 'Huffman Coding Cost', p: 'ความถี่ a 5, b 9, c 12, d 13, e 16, f 45 หาผลรวมน้ำหนักของการรวมทุกครั้ง',
      q: 'ทำอย่างไร', o: ['รวมสองตัวที่มากสุด', 'รวมสองตัวที่น้อยสุดซ้ำ ๆ (min-heap)', 'รวมตามลำดับตัวอักษร', 'รวมทุกตัวครั้งเดียว'], a: 1,
      steps: ['5 + 9 = 14 · 12 + 13 = 25', '14 + 16 = 30 · 25 + 30 = 55', '45 + 55 = 100', '14 + 25 + 30 + 55 + 100'], res: '224', big: 'O(n log n)' },
  ];

  function actViz(slot) {
    const acts = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 8], [5, 9], [6, 10], [8, 11]];
    const fr = [{ st: {}, cap: 'เรียงตามเวลาจบแล้ว (บนลงล่าง)' }];
    const st = {};
    let last = -1;
    acts.forEach(([s, e], i) => {
      if (s >= last) {
        const prev = last;
        st[i] = 'on'; last = e;
        fr.push({ st: { ...st }, now: i, cap: prev < 0 ? `(${s}, ${e}) จบเร็วที่สุด → <b>เลือก</b>` : `(${s}, ${e}) เริ่ม ${s} ≥ งานล่าสุดจบ ${prev} → <b>เลือก</b>` });
      }
      else { st[i] = 'no'; fr.push({ st: { ...st }, now: i, cap: `(${s}, ${e}) เริ่ม ${s} ก่อนงานล่าสุดจบ (${last}) → ข้าม` }); }
    });
    fr.push({ st: { ...st }, cap: 'ได้ 3 งาน: (1,4) (5,7) (8,11)' });
    const T = 12;
    Lab.stepper(Lab.stage(slot), {
      frames: fr, speed: 1000,
      render(el, f) {
        el.innerHTML = `<div class="scroll"><div class="tline"><div class="ax">${Array.from({ length: T + 1 }, (_, t) => `<span style="left:${(t / T) * 100}%">${t}</span>`).join('')}</div>${acts.map(([s, e], i) => `<div class="tr"><span class="n">งาน ${i + 1}</span><div class="lane"><div class="bar ${f.now === i ? 'now' : f.st[i] || ''}" style="left:${(s / T) * 100}%;width:${((e - s) / T) * 100}%">${s}–${e}</div></div></div>`).join('')}</div></div>`;
        return f.cap;
      },
    });
  }

  function fracViz(slot) {
    const items = [[60, 10, '#0C9A83'], [100, 20, '#4A52E0'], [120, 30, '#E8641B']];
    const fr = [{ take: [0, 0, 0], cap: 'กระเป๋าว่าง รับได้ 50' }, { take: [1, 0, 0], cap: 'v/w = 6 สูงสุด → ใส่ทั้งชิ้น (60, 10) · ได้ 60' }, { take: [1, 1, 0], cap: 'v/w = 5 → ใส่ทั้งชิ้น (100, 20) · ได้ 160 เหลือที่ 20' }, { take: [1, 1, 2 / 3], cap: 'ชิ้นสุดท้ายใส่ได้ 20 จาก 30 → 120 × 2/3 = 80 · รวม <b>240</b>' }];
    Lab.stepper(Lab.stage(slot), {
      frames: fr, speed: 1400,
      render(el, f) {
        el.innerHTML = `<div class="scroll"><div class="fillbar">${items.map(([v, w, c], i) => f.take[i] ? `<div style="flex:0 0 ${((w * f.take[i]) / 50) * 100}%;background:${c}">${f.take[i] < 1 ? '⅔ × ' : ''}${v}</div>` : '').join('')}</div></div>`;
        return f.cap;
      },
    });
  }

  function platViz(slot) {
    const arr = [900, 940, 950, 1100, 1500, 1800], dep = [910, 1200, 1120, 1130, 1900, 2000];
    const ev = [];
    arr.forEach((t, i) => ev.push([t, 1, i]));
    dep.forEach((t, i) => ev.push([t, -1, i]));
    ev.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const fr = [{ inS: [], cnt: 0, best: 0, cap: 'เดินตามเวลา เข้า +1 ออก −1' }];
    let cnt = 0, best = 0;
    const inS = new Set();
    for (const [t, d, i] of ev) {
      cnt += d; best = Math.max(best, cnt);
      if (d > 0) inS.add(i); else inS.delete(i);
      fr.push({ inS: [...inS], now: i, cnt, best, cap: `${t} รถไฟ ${i + 1} ${d > 0 ? 'เข้า' : 'ออก'} → ใช้อยู่ ${cnt} ช่อง · สูงสุด ${best}` });
    }
    const lo = 850, hi = 2050, pct = (t) => ((t - lo) / (hi - lo)) * 100;
    Lab.stepper(Lab.stage(slot), {
      frames: fr, speed: 900,
      render(el, f) {
        el.innerHTML = `<div class="scroll"><div class="tline"><div class="ax">${[900, 1100, 1300, 1500, 1700, 1900].map((t) => `<span style="left:${pct(t)}%">${t}</span>`).join('')}</div>${arr.map((a, i) => `<div class="tr"><span class="n">ขบวน ${i + 1}</span><div class="lane"><div class="bar ${f.now === i ? 'now' : f.inS.includes(i) ? 'on' : ''}" style="left:${pct(a)}%;width:${pct(dep[i]) - pct(a)}%"></div></div></div>`).join('')}</div></div>
          <div class="calc" style="text-align:center">ใช้อยู่ <b>${f.cnt}</b> · สูงสุด <b>${f.best}</b></div>`;
        return f.cap;
      },
    });
  }

  Lab.register({
    id: 'greedylab', ch: 'gr', title: 'โจทย์ Greedy จาก lab', sub: '12 แบบ ตอบให้ได้ว่าต้องเรียงหรือเลือกตามอะไร', minutes: 15, checks: 12, slide: 'lab Greedy 12 ข้อ',
    mount(root) {
      const L = 'greedylab';
      let s = Lab.beat(root, {
        kick: 'วิธีใช้',
        title: 'ทายเกณฑ์ก่อน แล้วค่อยดูเฉลย',
        html: `<p>โจทย์ greedy ส่วนใหญ่จบที่คำถามเดียว <b>ต้องเรียงหรือเลือกตามอะไร</b> ตอบถูกแล้ววิธีทำทีละขั้นจะเปิดให้ดู</p>
          <div class="rule"><span class="lbl">จำเกณฑ์</span>จบเร็วสุด → เวลาจบ · คุ้มสุด → v/w · กำไร+deadline → กำไร แล้ววางช่องช้าสุด · รวมทีละคู่ให้ถูกสุด → สองตัวน้อยสุด · จับคู่ให้สมดุล → น้อยสุดกับมากสุด</div>`,
      });
      s = Lab.beat(root, { wide: false });
      PROBS.forEach((pb, n) => {
        const card = document.createElement('div');
        card.className = 'lab-card';
        card.innerHTML = `<div class="tag2">ข้อ ${n + 1} · ${pb.big}</div><h3>${pb.t}</h3><p class="pb">${pb.p}</p><div class="chk"></div>
          <div class="solve"><ol>${pb.steps.map((x) => `<li>${x}</li>`).join('')}</ol><div class="res">คำตอบ: ${pb.res}</div>${pb.warn ? `<div class="warn">${pb.warn}</div>` : ''}<div class="viz" style="margin-top:12px"></div></div>`;
        s.append(card);
        const chk = card.querySelector('.chk');
        Lab.check(chk, { lesson: L, key: 'p' + (n + 1), label: 'เกณฑ์', q: pb.q, options: pb.o, answer: pb.a, why: 'ดูวิธีทำด้านล่าง' });
        const open = () => {
          const sv = card.querySelector('.solve');
          if (sv.classList.contains('on')) return;
          sv.classList.add('on');
          const vz = card.querySelector('.viz');
          if (pb.viz === 'act') actViz(vz);
          if (pb.viz === 'frac') fracViz(vz);
          if (pb.viz === 'plat') platViz(vz);
        };
        if (Lab.progress.get(L).includes('p' + (n + 1))) open();
        chk.addEventListener('click', () => { if (chk.querySelector('.opt.right')) open(); });
      });

      Lab.recap(root, [
        'หาให้ได้ว่า "ดีที่สุดตอนนี้" วัดด้วยอะไร แล้ว sort ตามนั้น (ส่วนใหญ่ O(n log n))',
        'ถ้าต้องหยิบค่าน้อยสุดซ้ำ ๆ ใช้ min-heap (ต่อเชือก, Huffman)',
        'greedy ไม่ได้ถูกเสมอ ถ้าหา counterexample ได้ 1 ตัวคือใช้ไม่ได้ (เช่น 0/1 knapsack)',
      ]);
    },
  });
})();
