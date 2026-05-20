import type { Assignment } from "../types";

/**
 * Partial seed for Vet to be 2569 (2026).
 *
 * Source: ตารางรายแผนก_FINAL.pdf + สิ่งที่เปลี่ยน_FINAL.pdf (2026-05-19).
 *
 * THIS IS NOT THE COMPLETE 290-SLOT DATASET.
 * - The full FINAL PDF has 290 assignments; this seed covers ~60 high-signal
 *   rows: the 23 students from the changelog (with verified manual swaps) +
 *   ~40 representative W1–W14 rows lifted from the master grid.
 * - The remaining ~230 assignments live in the original FINAL PDF on Palm's
 *   machine and the Google Sheets that ทีมหัวปี cuvet86 published.
 * - Phase 1b will import the full dataset into Supabase via the admin console
 *   once schema + auth are wired.
 *
 * Trainees: please use the "report inaccuracy" flow if you see your row
 * misrepresented — this seed was transcribed by AI and may have typos.
 *
 * Data confidence tier: ASSIGNMENT-LEVEL crowdsourced trust:
 *   - source "manual-swap"  = high confidence (from changelog PDF, ทีมหัวปี-verified)
 *   - source "algorithm"    = medium confidence (transcribed from grid PDF)
 *   - source "verified-self-report" = high (only set after a trainee confirms)
 */

const A = (
  dept_slug: string,
  week: number,
  nickname: string,
  short_id: string,
  year: 4 | 5,
  days: number,
  rank: Assignment["rank"],
  source: Assignment["source"] = "algorithm",
  full_name?: string,
  notes?: string
): Assignment => ({
  id: `2569-${dept_slug}-w${week}-${short_id}`,
  year_id: 2569,
  dept_slug,
  week,
  short_id,
  nickname,
  full_name,
  student_year: year,
  days_practiced: days,
  rank,
  source,
  notes,
});

export const SEED_2569: Assignment[] = [
  // ── Changelog: 7 dept-swaps (same week) ─────────────────────────────────
  A("pharmacy", 5, "ปอง", "122", 4, 7, "manual", "manual-swap", "รมิดา ภาเวช", "ย้ายจาก มะเร็ง W5"),
  A("pharmacy", 7, "กิ๊ม", "002", 4, 7, "manual", "manual-swap", "กชพร ธีระเดชานนท์", "ย้ายจาก มะเร็ง W7"),
  A("alternative-medicine", 4, "คิว", "048", 4, 5, "manual", "manual-swap", "ธนัทชนนท์ กลิ่นเขียว", "ย้ายจาก มะเร็ง W4"),
  A("nephrology-cardiac", 7, "สตังค์", "047", 4, 7, "manual", "manual-swap", "ธนัญชนก ถนอมศักดิ์", "ย้ายจาก มะเร็ง W7"),
  A("obstetrics", 1, "แพรวา", "107", 4, 7, "manual", "manual-swap", "แพรวรา หญูสมบูรณ์เดช", "ย้ายจาก มะเร็ง W1"),
  A("obstetrics", 6, "ปิยะ", "014", 4, 7, "manual", "manual-swap", "จรัสณัฐ วงษ์กำปั่น", "ย้ายจาก มะเร็ง W6"),
  A("internal-medicine", 1, "ไพรซ์", "021", 4, 5, "manual", "manual-swap", "ชญานิษฐ์ ชีวศรีรุ่งเรือง", "ย้ายจาก มะเร็ง W1"),

  // ── Changelog: 11 new slot additions ────────────────────────────────────
  A("ccu", 9, "ลี่", "038", 4, 6, "manual", "manual-swap", "ณัฐุรา สุทธิศักดา", "เพิ่ม slot · กลับมาฝึก"),
  A("internal-medicine", 5, "ลี่", "038", 4, 7, "manual", "manual-swap", "ณัฐุรา สุทธิศักดา", "เพิ่ม slot · กลับมาฝึก"),
  A("ccu", 7, "แก้ม", "031", 5, 7, "manual", "manual-swap", "ซิชญา จุนทองวิรัตน์", "เพิ่ม slot"),
  A("oncology", 6, "แก้ม", "031", 5, 7, "manual", "manual-swap", "ซิชญา จุนทองวิรัตน์", "เพิ่ม slot"),
  A("obstetrics", 6, "ปาล์มมี่", "088", 4, 7, "manual", "manual-swap", "พัณวลัย มงคลพงศพัฒน์", "เพิ่ม slot"),
  A("nephrology-cardiac", 3, "ปาล์มมี่", "088", 4, 4, "manual", "manual-swap", "พัณวลัย มงคลพงศพัฒน์", "เพิ่ม slot · W3 = 4 วัน"),
  A("surgery", 7, "มดแดง", "022", 4, 7, "manual", "manual-swap", "ชญานี วัชราทิตย์", "เพิ่ม slot ศัลย์"),
  A("surgery", 8, "บุ่น", "008", 4, 7, "manual", "manual-swap", "กษิดิ์เดช ภูไพจิตร์กุล", "เพิ่ม slot ศัลย์"),
  A("obstetrics", 7, "เจ่เจ๋", "023", 4, 7, "manual", "manual-swap", "ชนม์นิภา รุจนวิศาล", "เพิ่ม slot"),
  A("surgery", 7, "โฟกัส", "111", 4, 7, "manual", "manual-swap", "ภัทรนันท์ โชติประภา", "เพิ่ม slot ศัลย์"),
  A("dermatology", 6, "แจน", "122", 5, 7, "manual", "manual-swap", "โยษิตา ยิ้มละมัย", "เพิ่ม slot"),
  A("nephrology-cardiac", 8, "แจน", "122", 5, 7, "manual", "manual-swap", "โยษิตา ยิ้มละมัย", "เพิ่ม slot"),
  A("obstetrics", 1, "ต้นไผ่", "030", 5, 7, "manual", "manual-swap", "ชัยณภัทร อรัณยะปาล", "เพิ่ม slot"),
  A("ccu", 8, "เอม", "031", 4, 7, "manual", "manual-swap", "ฐิติรัตน์ นครไทย", "เพิ่ม slot"),
  A("emergency", 11, "เอม", "031", 4, 7, "manual", "manual-swap", "ฐิติรัตน์ นครไทย", "เพิ่ม slot"),
  A("obstetrics", 4, "โอปอล", "090", 5, 7, "manual", "manual-swap", "ปาลิตา หล่ำเจริญ", "เพิ่ม slot"),

  // ── Changelog: 1 move + add ─────────────────────────────────────────────
  A("pharmacy", 1, "ไพรซ์", "021", 4, 7, "manual", "manual-swap", "ชญานิษฐ์ ชีวศรีรุ่งเรือง", "เพิ่ม slot คู่กับ อายุร W1"),

  // ── ตารางรายแผนก: คลินิกโรคไต หัวใจ ──────────────────────────────────────
  A("nephrology-cardiac", 1, "มี่ฆ์", "125", 4, 7, "rank-1", "algorithm", "รสริณ ไปรษิวัฒนา"),
  A("nephrology-cardiac", 1, "แดงค์", "150", 5, 7, "rank-1", "algorithm", "สุริยชาติ บุญจำเริญ"),
  A("nephrology-cardiac", 1, "ใบบัว", "056", 5, 7, "rank-1", "algorithm", "ฌนภา มารมย์"),
  A("nephrology-cardiac", 2, "จัยช์", "015", 4, 7, "rank-1", "algorithm", "จันทกานต์ รัตนพรมงคล"),
  A("nephrology-cardiac", 2, "แบม", "032", 4, 7, "rank-1", "algorithm", "ณัชชา พุฒิสันติกุล"),
  A("nephrology-cardiac", 2, "สาด", "067", 4, 7, "rank-1", "algorithm", "ปริดา สังหะร์"),
  A("nephrology-cardiac", 3, "ปุย", "079", 4, 4, "rank-1", "algorithm", "ปิ่นประภา ราชพิบูลย์", "W3 = 4 วัน"),
  A("nephrology-cardiac", 8, "สเตอร์", "060", 4, 7, "rank-1", "algorithm", "กัญญาวีร์ ศรีพรัสนีย"),
  A("nephrology-cardiac", 8, "พี่ตี้", "068", 4, 7, "rank-1", "algorithm", "นารายา ชาตะสุภณ"),
  A("nephrology-cardiac", 12, "เบรียม", "041", 5, 7, "rank-1", "algorithm", "พิชญดา ทำมา"),
  A("nephrology-cardiac", 13, "นุก", "036", 4, 7, "rank-1", "algorithm", "มัชชา ห้ามวา"),

  // ── ตารางรายแผนก: คลินิกโรคผิวหนัง (ปี 5 only) ────────────────────────────
  A("dermatology", 1, "น้ำหวาน", "082", 5, 7, "rank-1", "algorithm", "ปนัดดา ทรัพย์อรัญ"),
  A("dermatology", 1, "พั้น", "099", 5, 7, "rank-1", "algorithm", "พิชญุพัม ซิงข์ฮอง"),
  A("dermatology", 2, "พริม", "154", 5, 7, "rank-1", "algorithm", "อรนลิน จิรประเสริฐวงศ์"),
  A("dermatology", 2, "ซีซี่", "118", 5, 7, "rank-1", "algorithm", "ภูวธีตา อิทธิพานิชพงศ์"),
  A("dermatology", 4, "ต้นไผ่", "030", 5, 7, "rank-1", "algorithm", "ชัยณภัทร อรัณยะปาล"),
  A("dermatology", 4, "เจโต้", "132", 5, 7, "rank-1", "algorithm", "วรัญญิภา วงดันเก้ว"),
  A("dermatology", 5, "เซ็น", "071", 5, 7, "rank-1", "algorithm", "ชวิศ วงดีปียะสนิตย์"),

  // ── ตารางรายแผนก: คลินิกโรคมะเร็ง (after manual swaps) ─────────────────
  A("oncology", 2, "เซ็น", "071", 5, 7, "rank-2", "algorithm", "ชวิศ วงดีปียะสนิตย์"),
  A("oncology", 3, "เจฟ", "013", 5, 4, "rank-1", "algorithm", "เกษม ธรรมปรานี", "W3 = 4 วัน"),
  A("oncology", 9, "อิง", "039", 4, 6, "rank-1", "algorithm", "ณิชกมล ชูฮา", "W9 = 6 วัน · เสี่ยงไม่ครบ 7"),

  // ── ตารางรายแผนก: คลินิกสัตว์พิเศษ (ปี 5 only) ─────────────────────────────
  A("exotic-pet", 1, "ดีน", "016", 5, 5, "rank-1", "algorithm", "ศิภูการ วณิช นันทราคา"),
  A("exotic-pet", 1, "ฟิฬา", "115", 5, 5, "rank-1", "algorithm", "ภิจาราวดี ภูเลขย่าง"),
  A("exotic-pet", 2, "ครีม", "138", 5, 5, "rank-1", "algorithm", "ศวิตา วิดตามนาที"),

  // ── ตารางรายแผนก: ชันสูตร (ผ่าซาก) ─────────────────────────────────────
  A("necropsy", 1, "เจฟ", "007", 5, 7, "rank-1", "algorithm", "กวี อนุทรงศักดิ์"),
  A("necropsy", 1, "ภาตื่น", "037", 5, 7, "rank-1", "algorithm", "ณัฐพัฐญ์ ไวยะนงคล"),
  A("necropsy", 3, "ดี้", "147", 5, 2, "rank-1", "algorithm", "ปึณณ์หัศ เอื้อมเจริญ", "W3 = 2 วัน"),

  // ── ตารางรายแผนก: แผนกศัลยกรรม (4 คน หลัง add) ──────────────────────────
  A("surgery", 6, "มดแดง", "022", 4, 7, "manual", "manual-swap", "ชญานี วัชราทิตย์"),
  A("surgery", 7, "ฟ้า", "141", 4, 7, "rank-1", "algorithm", "ลีนภัทร เกียรติสกุลทอง"),

  // ── ตารางรายแผนก: แผนกสูติกรรม ─────────────────────────────────────────
  A("obstetrics", 2, "นบ", "116", 4, 7, "rank-1", "algorithm", "มนต์นภา แสนนาม"),
  A("obstetrics", 2, "อิ๊ม", "050", 4, 7, "rank-1", "algorithm", "ธนาวีร์ วงศ์ศิริกุล"),
  A("obstetrics", 8, "เบ็จ์", "069", 4, 7, "rank-1", "algorithm", "นภัทร ศิริธรรนธารี"),
  A("obstetrics", 8, "มินนี่", "040", 4, 7, "rank-1", "algorithm", "ภูวลัม กาน์เซราก"),
  A("obstetrics", 9, "เม่อ", "010", 5, 6, "rank-1", "algorithm", "กัญญาพัชร์ วรรณวิไล", "W9 = 6 วัน · เสี่ยงไม่ครบ 7"),

  // ── ตารางรายแผนก: อายุรกรรม ───────────────────────────────────────────
  A("internal-medicine", 1, "เบนซ์", "128", 4, 5, "rank-1", "algorithm", "ลักขณา วิโรจน์รัตน์", "W1 only · ฝึก 5 วัน · ไม่ครบ 7 = ❌ cert"),
  A("internal-medicine", 1, "แม่ม", "109", 5, 5, "rank-1", "algorithm", "ภาสรา ทรงอัมจิตติ"),
  A("internal-medicine", 2, "ซิ่ว", "011", 5, 5, "rank-1", "algorithm", "กัญณัฏฐ์ เต็มประเสริฐ"),
  A("internal-medicine", 2, "พิมพ์ข้าว", "105", 5, 5, "rank-1", "algorithm", "พิมพ์รวี เยื้องกลาง"),
  A("internal-medicine", 3, "สลิล", "140", 5, 4, "rank-1", "algorithm", "สลิลทิพย์ เฮงนิชกุล", "W3 = 4 วัน"),

  // ── ตารางรายแผนก: หน่วยจักษุ ──────────────────────────────────────────
  A("ophthalmology", 1, "พิมพ์ข้าว", "105", 5, 7, "rank-1", "algorithm", "พิมพ์รวี เยื้องกลาง"),
  A("ophthalmology", 1, "เต็มเปียม", "084", 4, 7, "rank-1", "algorithm", "พลอยแม่นมัย ปริศนานันคุล"),
  A("ophthalmology", 2, "ปาน", "106", 4, 7, "rank-1", "algorithm", "เพชรไพลิน วิริยะวิษฎุล"),
  A("ophthalmology", 2, "ปาน", "144", 4, 7, "rank-1", "algorithm", "สิริกร แสงจันทร์"),

  // ── หน่วยเวชศาสตร์ฉุกเฉิน (ER) ────────────────────────────────────────
  A("emergency", 1, "เนิร์น", "063", 4, 7, "rank-1", "algorithm", "เนตรชนก ศรีศุภชัยยา"),
  A("emergency", 1, "ไอส์", "142", 5, 7, "rank-1", "algorithm", "สิริรัตน์ ยู่เนิ้นทรัพย์"),
  A("emergency", 2, "ปั้น", "075", 4, 7, "rank-1", "algorithm", "ปัณฑิตา จินคาลิตร"),
  A("emergency", 2, "พิช", "102", 4, 7, "rank-1", "algorithm", "พิชชา นุยา"),
  A("emergency", 5, "ม่อน", "134", 4, 7, "rank-1", "algorithm", "วันรุ่ง วรรณวิทยาภา"),

  // ── หน่วยเวชศาสตร์ทางเลือก ─────────────────────────────────────────────
  A("alternative-medicine", 1, "ภาฤพ์", "112", 4, 5, "rank-1", "algorithm", "ภาคุพงศ์ เขียวประเสริฐ"),
  A("alternative-medicine", 1, "พีช", "073", 5, 5, "rank-1", "algorithm", "ปริญญ์ สุภัครากุล"),

  // ── หน่วยเวชศาสตร์ฟื้นฟู ───────────────────────────────────────────────
  A("rehabilitation", 1, "เบลล์", "001", 4, 3, "rank-1", "algorithm", "ขจิจร บุญนคร", "W1 = 3 วัน (ฟื้นฟูเปิด จ.–พ. เท่านั้น)"),
  A("rehabilitation", 1, "พั้น", "140", 5, 3, "rank-1", "algorithm", "สุพัดชา สวัสดิ์ชัย"),
  A("rehabilitation", 2, "ปริม", "082", 4, 3, "rank-1", "algorithm", "เปมิกา เขวงประเสริฐ", "W2 only · ฝึก 3 วัน · ไม่ครบ 7 = ❌ cert"),

  // ── ห้องผ่าตัด ─────────────────────────────────────────────────────────
  A("operating-room", 1, "เดือนเต็มดวง", "055", 5, 7, "rank-1", "algorithm", "เดือนเต็มดวง ถนอมพิชย"),
  A("operating-room", 1, "แวนดา", "136", 4, 7, "rank-1", "algorithm", "แวนดา ทาร่อน"),

  // ── ห้องยา ────────────────────────────────────────────────────────────
  A("pharmacy", 1, "แก๊ม", "031", 4, 7, "rank-1", "algorithm", "ซิชญา จุนทองวิรัตน์"),
  A("pharmacy", 1, "ไพรซ์", "021", 4, 7, "rank-1", "manual-swap", "ชญานิษฐ์ ชีวศรีรุ่งเรือง"),
  A("pharmacy", 4, "บลู", "033", 4, 7, "rank-1", "algorithm", "ณัชชา ศุภชัยโกศล"),

  // ── CCU ───────────────────────────────────────────────────────────────
  A("ccu", 1, "หัฏฐภัทร์", "152", 5, 7, "rank-1", "algorithm", "หัฏฐภัทร์ ลิ้มวรรณเลียน"),
  A("ccu", 1, "เจ", "142", 4, 7, "rank-1", "algorithm", "โสณ ธนศรีสถิตย์"),
  A("ccu", 2, "แม่ม", "109", 5, 7, "rank-1", "algorithm", "ภาสร ทรงอัมจิตติ"),

  // ── PR / VDO ──────────────────────────────────────────────────────────
  A("pr-vdo", 1, "โพ้ตัด", "070", 4, 7, "rank-1", "algorithm", "ปภาวรินทร์ จ่างเจริญ"),
  A("pr-vdo", 2, "พั้น", "140", 5, 7, "rank-1", "algorithm", "สุพัดชา สวัสดิ์ชัย"),
  A("pr-vdo", 5, "พิมพ์ฉัตร", "100", 4, 7, "rank-1", "algorithm", "พิมพ์ฉัตร์ นิยขณินิษฐ"),

  // ── เวชระเบียน ────────────────────────────────────────────────────────
  A("medical-records", 1, "เม่อ", "010", 5, 7, "rank-1", "algorithm", "กัญญาพัชร์ วรรณวิไล"),
  A("medical-records", 1, "เปมิกา", "082", 4, 7, "rank-1", "algorithm", "เปมิกา เขวงประเสริฐ"),
  A("medical-records", 1, "พีรญา", "103", 4, 7, "rank-1", "algorithm", "พีรญา สิญรัตน์"),

  // ── ศูนย์วิจัยโรคสัตว์น้ำ (ปี 5 only, ≥ 2 wk continuous) ─────────────────
  A("aquatic", 2, "ธัญชนก", "062", 5, 7, "rank-1", "algorithm", "ธัญชนก เอกพิมพ์", "ฝึกต่อเนื่องใน W1-W5"),
];

/** Lookup helpers built once at module load */
export const ASSIGNMENTS_BY_SHORT_ID = (() => {
  const map = new Map<string, Assignment[]>();
  for (const a of SEED_2569) {
    const arr = map.get(a.short_id) ?? [];
    arr.push(a);
    map.set(a.short_id, arr);
  }
  return map;
})();

export const ASSIGNMENTS_BY_NICKNAME = (() => {
  const map = new Map<string, Assignment[]>();
  for (const a of SEED_2569) {
    const arr = map.get(a.nickname.toLowerCase()) ?? [];
    arr.push(a);
    map.set(a.nickname.toLowerCase(), arr);
  }
  return map;
})();

export const ASSIGNMENTS_BY_DEPT = (() => {
  const map = new Map<string, Assignment[]>();
  for (const a of SEED_2569) {
    const arr = map.get(a.dept_slug) ?? [];
    arr.push(a);
    map.set(a.dept_slug, arr);
  }
  return map;
})();
