import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับเว็บนี้",
  description: "Vet to be เป็นโครงการฝึกงานคลินิกที่โรงพยาบาลสัตว์เล็กจุฬาฯ — เว็บนี้เก็บข้อมูลย้อนหลังและช่วยรันโครงการรอบใหม่",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-serif font-semibold mb-3">เกี่ยวกับ Vet to be</h1>
      <p className="text-lg text-[var(--color-ink-muted)] leading-relaxed mb-8">
        Vet to be เป็นโครงการฝึกงานคลินิกของนิสิตคณะสัตวแพทยศาสตร์ จุฬาฯ
        — ในช่วงปิดเทอมใหญ่ (ปี 3 ขึ้น ปี 4 และ ปี 4 ขึ้น ปี 5) นิสิตจะได้หมุนเวียน
        ฝึกใน 18 แผนกของโรงพยาบาลสัตว์เล็กจุฬาฯ ตลอด 14 สัปดาห์
      </p>

      <Section title="ทำไมต้องมีเว็บนี้">
        <p>
          แต่ก่อน ข้อมูลรอบฝึกของแต่ละปีอยู่ใน Google Sheets แยกกันหลายๆ ไฟล์
          ผ่านมือทีมหัวปีคนละรุ่น กระจัดกระจาย ไม่มีใครเก็บประวัติยาวๆ
        </p>
        <p>
          เว็บนี้ตั้งใจให้เป็น <strong className="text-[var(--color-ink)]">ศูนย์รวมระยะยาว</strong> —
          ทุกปีอยู่ในที่เดียว ค้นหาได้ รีวิวได้ และทีมหัวปีรุ่นต่อไปก็ใช้รันรอบฝึกใหม่ได้
          ไม่ต้องเริ่มจากศูนย์
        </p>
      </Section>

      <Section title="ฟีเจอร์หลัก 5 อย่าง">
        <ol className="list-decimal list-inside space-y-2 text-[var(--color-ink-muted)] [&>li>strong]:text-[var(--color-ink)]">
          <li>
            <strong>ค้นรายชื่อย้อนหลัง</strong> — พิมพ์ชื่อเล่นหรือเลขท้ายรหัส
            ดูว่าตัวเองอยู่แผนกอะไร ฝึกกี่วัน ปีไหน
          </li>
          <li>
            <strong>รีวิวแต่ละแผนก × ปี</strong> — คนที่เคยฝึกจริงรีวิวแผนก
            (เปิดในเฟสถัดไป)
          </li>
          <li>
            <strong>Operations console</strong> — ทีมหัวปีจัดรอบใหม่ได้ในเว็บ
            ไม่ต้องใช้ Excel + claude.ai แยกกันอีก (เฟสถัดไป)
          </li>
          <li>
            <strong>คลังย้อนหลังระยะยาว</strong> — ข้อมูลทุกปีเก็บไว้ตลอด
            รุ่นน้องดูได้ว่าก่อนหน้านี้ใครเคยฝึกตรงไหน
          </li>
          <li>
            <strong>หน้า public hub</strong> — สำหรับผู้สนใจ
            (ว่าที่นิสิตที่อยากรู้ ว่าโครงการนี้ทำอะไร)
          </li>
        </ol>
      </Section>

      <Section title="ข้อมูลความถูกต้อง">
        <p>
          ปี <strong className="text-[var(--color-ink)]">2569 (2026)</strong> —
          ข้อมูลส่วนใหญ่มาจากผลจัดเวรอัตโนมัติ + manual swaps ของทีมหัวปี cuvet86
          ผ่านการตรวจรอบสุดท้ายที่ FINAL PDF (19 พ.ค. 2569) — ยืนยันได้ระดับสูง
        </p>
        <p>
          ปี <strong className="text-[var(--color-ink)]">2567, 2568</strong> —
          ยังเป็น placeholder รอ crowdsource จากรุ่นพี่ในเฟสถัดไป
        </p>
        <p>
          ⚠️ <strong className="text-[var(--color-ink)]">ข้อมูลในเฟสนี้ (partial seed)</strong>{" "}
          มี ~60 รายจาก 290 — ที่เหลืออยู่ใน FINAL PDF ของทีมหัวปี รอ import
          เข้า Supabase backend ในเฟสถัดไป
        </p>
        <p>
          ถ้าเจอข้อมูลของตัวเองคลาดเคลื่อน — ติดต่อทีมหัวปี cuvet86 หรือรอปุ่ม
          "report inaccuracy" ที่จะมาในเฟสถัดไป
        </p>
      </Section>

      <Section title="Roadmap">
        <ul className="space-y-2 text-[var(--color-ink-muted)]">
          <li>✅ <strong className="text-[var(--color-ink)]">Phase 0</strong> — ดึงข้อมูลจาก claude.ai ลง vault</li>
          <li>✅ <strong className="text-[var(--color-ink)]">Phase 1a</strong> — Scaffold + theme + หน้าหลัก</li>
          <li>🔜 <strong className="text-[var(--color-ink)]">Phase 1b</strong> — Supabase backend + import 290 slots</li>
          <li>🔜 <strong className="text-[var(--color-ink)]">Phase 1c</strong> — Auth + รีวิวแผนก</li>
          <li>🔜 <strong className="text-[var(--color-ink)]">Phase 1d</strong> — Operations console (ทีมหัวปี)</li>
          <li>📅 <strong className="text-[var(--color-ink)]">Phase 1e</strong> — Crowdsource ย้อนหลัง 2567/2568</li>
        </ul>
      </Section>

      <Section title="ใครทำ">
        <p>
          เว็บนี้ส่วนหนึ่งของ <Link href="https://cuvetsmo.com">CUVETSMO ecosystem</Link>
          — โดยสโมสรนิสิตคณะสัตวแพทยศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย
        </p>
        <p>
          อ่านเพิ่มเติม: <a href="https://labs.cuvetsmo.com">Labs</a>{" "}·{" "}
          <a href="https://imaging.cuvetsmo.com">Imaging</a>{" "}·{" "}
          <a href="https://web3.cuvetsmo.com">Web3</a>
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-serif font-semibold mb-3 !text-[var(--color-ink)]">{title}</h2>
      <div className="space-y-3 text-[var(--color-ink-muted)] leading-relaxed">{children}</div>
    </section>
  );
}
