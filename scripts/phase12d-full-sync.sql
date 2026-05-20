-- ===================================================================
-- Phase 12d: full sync of vettobe_assignments year=2569 against
-- ตารางรายแผนก_FINAL.pdf (5/19) — AUTHORITATIVE source of truth
--
-- Strategy:
--   1. Stage parsed FINAL rows (290 rows)
--   2. UPDATE matching DB rows (preserves UUID + full_name + reviewer history)
--   3. INSERT FINAL-only rows (looks up full_name by short_id+nickname+year)
--   4. DELETE DB-only rows
--   5. Refresh year stats
-- ===================================================================

BEGIN;

CREATE TEMP TABLE _final_2569 (
  dept_slug TEXT NOT NULL,
  week INT NOT NULL,
  short_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  student_year INT NOT NULL,
  days_practiced INT NOT NULL,
  days_note TEXT
) ON COMMIT DROP;

INSERT INTO _final_2569 (dept_slug, week, short_id, nickname, student_year, days_practiced, days_note) VALUES
  ('nephrology-cardiac', 1, '125', 'ณัฐ', 4, 7, NULL),
  ('nephrology-cardiac', 1, '150', 'แต๊ง', 5, 7, NULL),
  ('nephrology-cardiac', 1, '056', 'ใบบัว', 5, 7, NULL),
  ('nephrology-cardiac', 2, '015', 'ซิม', 4, 7, NULL),
  ('nephrology-cardiac', 2, '032', 'แบม', 4, 7, NULL),
  ('nephrology-cardiac', 2, '067', 'ดา', 4, 7, NULL),
  ('nephrology-cardiac', 3, '002', 'ก๊ิม', 4, 7, NULL),
  ('nephrology-cardiac', 3, '079', 'ป่นิ', 4, 7, NULL),
  ('nephrology-cardiac', 3, '088', 'ปาล์มม่ี', 4, 7, NULL),
  ('nephrology-cardiac', 4, '092', 'พิณ', 5, 7, NULL),
  ('nephrology-cardiac', 4, '017', 'บอมแบม', 4, 7, NULL),
  ('nephrology-cardiac', 4, '123', 'แบม', 4, 7, NULL),
  ('nephrology-cardiac', 5, '024', 'ชนา', 4, 7, NULL),
  ('nephrology-cardiac', 5, '062', 'จ๋า', 4, 7, NULL),
  ('nephrology-cardiac', 5, '056', 'กอหญ้า', 5, 7, NULL),
  ('nephrology-cardiac', 6, '154', 'เฟิร์ส', 4, 7, NULL),
  ('nephrology-cardiac', 6, '010', 'กัญ', 4, 7, NULL),
  ('nephrology-cardiac', 6, '126', 'แก้ม', 4, 7, NULL),
  ('nephrology-cardiac', 7, '048', 'คีน', 5, 7, NULL),
  ('nephrology-cardiac', 7, '132', 'ซัน', 4, 7, NULL),
  ('nephrology-cardiac', 7, '047', 'สตังค์', 4, 7, NULL),
  ('nephrology-cardiac', 8, '060', 'สตาร์', 4, 7, NULL),
  ('nephrology-cardiac', 8, '068', 'พีท', 4, 7, NULL),
  ('nephrology-cardiac', 8, '122', 'แจน', 5, 7, NULL),
  ('nephrology-cardiac', 9, '034', 'อลิน', 4, 7, NULL),
  ('nephrology-cardiac', 9, '089', 'ปูน', 4, 7, NULL),
  ('nephrology-cardiac', 9, '094', 'ปาล์ม', 5, 7, NULL),
  ('nephrology-cardiac', 10, '070', 'พราว', 5, 7, NULL),
  ('nephrology-cardiac', 10, '068', 'พีท', 4, 7, NULL),
  ('nephrology-cardiac', 10, '048', 'คิว', 4, 7, NULL),
  ('nephrology-cardiac', 11, '005', 'กัน', 4, 7, NULL),
  ('nephrology-cardiac', 11, '148', 'หมง', 5, 7, NULL),
  ('nephrology-cardiac', 11, '036', 'มุก', 5, 7, NULL),
  ('nephrology-cardiac', 12, '152', 'ซัน', 4, 7, NULL),
  ('nephrology-cardiac', 12, '006', 'ไอซ์', 4, 7, NULL),
  ('nephrology-cardiac', 12, '041', 'เปร้ยี ว', 4, 7, NULL),
  ('nephrology-cardiac', 13, '046', 'นาเนย', 5, 7, NULL),
  ('nephrology-cardiac', 13, '058', 'หลิง', 4, 7, NULL),
  ('nephrology-cardiac', 13, '094', 'แบม', 4, 7, NULL),
  ('nephrology-cardiac', 14, '146', 'อ๋ิง', 4, 7, NULL),
  ('nephrology-cardiac', 14, '105', 'บ๊ะจ่าง', 4, 7, NULL),
  ('nephrology-cardiac', 14, '141', 'ฝ้าย', 4, 7, NULL),
  ('dermatology', 1, '082', 'น  าหวาน', 5, 7, NULL),
  ('dermatology', 1, '099', 'พ้นั ช์', 5, 7, NULL),
  ('dermatology', 2, '154', 'พรีม', 5, 7, NULL),
  ('dermatology', 2, '118', 'ซีซี', 5, 7, NULL),
  ('dermatology', 4, '030', 'ต้นไผ่', 5, 7, NULL),
  ('dermatology', 4, '132', 'เจได', 5, 7, NULL),
  ('dermatology', 5, '027', 'มิ้นท์', 5, 7, NULL),
  ('dermatology', 5, '071', 'เทพ', 5, 7, NULL),
  ('dermatology', 6, '052', 'นีร', 5, 7, NULL),
  ('dermatology', 6, '122', 'แจน', 5, 7, NULL),
  ('dermatology', 7, '019', 'มัดหม่ี', 5, 7, NULL),
  ('dermatology', 7, '094', 'ปาล์ม', 5, 7, NULL),
  ('dermatology', 8, '011', 'ซิ่วซิ่ว', 5, 7, NULL),
  ('dermatology', 8, '140', 'สลิล', 5, 7, NULL),
  ('dermatology', 9, '047', 'ขุน', 5, 7, NULL),
  ('dermatology', 9, '136', 'ตุล', 5, 7, NULL),
  ('dermatology', 10, '100', 'ไป๊ป์', 5, 7, NULL),
  ('dermatology', 10, '065', 'อะตอม', 5, 7, NULL),
  ('dermatology', 11, '068', 'เจ้านาย', 5, 7, NULL),
  ('dermatology', 11, '107', 'แพร', 5, 7, NULL),
  ('dermatology', 12, '024', 'เรนน่ี', 5, 7, NULL),
  ('dermatology', 12, '070', 'พราว', 5, 7, NULL),
  ('dermatology', 13, '057', 'นโม', 5, 7, NULL),
  ('dermatology', 14, '148', 'หมง', 5, 7, NULL),
  ('dermatology', 14, '047', 'ขุน', 5, 7, NULL),
  ('oncology', 2, '027', 'มิ้นท์', 5, 7, NULL),
  ('oncology', 2, '038', 'เกรซ', 5, 7, NULL),
  ('oncology', 3, '007', 'เจ', 5, 7, NULL),
  ('oncology', 3, '056', 'ใบบัว', 5, 7, NULL),
  ('oncology', 4, '013', 'เจฟ', 5, 7, NULL),
  ('oncology', 6, '028', 'ส้มโอ', 5, 3, '(เฉพาะ18,19,20 มิ.ย.)'),
  ('oncology', 6, '031', 'แก้ม', 5, 3, '(เฉพาะ18,19,20 มิ.ย.)'),
  ('oncology', 9, '039', 'อิง', 4, 7, NULL),
  ('oncology', 9, '099', 'มะนาว', 4, 7, NULL),
  ('oncology', 10, '055', 'เดือน', 5, 7, NULL),
  ('oncology', 10, '057', 'พอย', 4, 7, NULL),
  ('oncology', 11, '162', 'มาร์ค', 5, 7, NULL),
  ('oncology', 11, '037', 'นีร', 5, 7, NULL),
  ('oncology', 12, '097', 'พิมพ์', 4, 7, NULL),
  ('oncology', 12, '073', 'พีช', 4, 7, NULL),
  ('oncology', 13, '131', 'บิวต้ี', 4, 7, NULL),
  ('oncology', 13, '089', 'ปูน', 4, 7, NULL),
  ('oncology', 14, '129', 'ซันน่ี', 4, 7, NULL),
  ('oncology', 14, '140', 'สลิล', 5, 7, NULL),
  ('exotic-pet', 1, '016', 'คีน', 5, 7, NULL),
  ('exotic-pet', 1, '115', 'ฟีฟ่า', 5, 7, NULL),
  ('exotic-pet', 2, '082', 'น  าหวาน', 5, 7, NULL),
  ('exotic-pet', 2, '138', 'ครีม', 5, 7, NULL),
  ('exotic-pet', 3, '085', 'โอเปิล', 5, 7, NULL),
  ('exotic-pet', 3, '061', 'ยูโกะ', 5, 7, NULL),
  ('exotic-pet', 4, '161', 'ถุงแป้ง', 5, 7, NULL),
  ('exotic-pet', 4, '064', 'มอ่ นแก้ว', 5, 7, NULL),
  ('exotic-pet', 5, '013', 'เจฟ', 5, 7, NULL),
  ('exotic-pet', 5, '154', 'พรีม', 5, 7, NULL),
  ('necropsy', 1, '007', 'เจ', 5, 7, NULL),
  ('necropsy', 1, '037', 'ภาคิน', 4, 7, NULL),
  ('necropsy', 2, '103', 'เนปจูน', 4, 7, NULL),
  ('necropsy', 2, '070', 'โฟกัส', 4, 7, NULL),
  ('necropsy', 3, '147', 'ปัน', 4, 7, NULL),
  ('necropsy', 3, '072', 'ส้ม', 4, 7, NULL),
  ('necropsy', 4, '031', 'แก้ม', 5, 7, NULL),
  ('necropsy', 4, '003', 'สุดเขต', 5, 7, NULL),
  ('necropsy', 5, '107', 'แพรวา', 4, 7, NULL),
  ('necropsy', 5, '081', 'แช็ป', 4, 7, NULL),
  ('surgery', 7, '022', 'มดแดง', 4, 7, NULL),
  ('surgery', 7, '111', 'โฟกัส', 4, 7, NULL),
  ('surgery', 8, '008', 'บุ๋น', 4, 7, NULL),
  ('obstetrics', 1, '112', 'พรีม', 5, 7, NULL),
  ('obstetrics', 1, '042', 'ริว', 5, 7, NULL),
  ('obstetrics', 1, '030', 'ต้นไผ่', 5, 7, NULL),
  ('obstetrics', 1, '107', 'แพรวา', 4, 7, NULL),
  ('obstetrics', 2, '116', 'เนย', 4, 7, NULL),
  ('obstetrics', 2, '050', 'อ๊ินท์', 4, 7, NULL),
  ('obstetrics', 3, '161', 'ถุงแป้ง', 5, 7, NULL),
  ('obstetrics', 3, '016', 'คีน', 5, 7, NULL),
  ('obstetrics', 4, '144', 'ปาน', 5, 7, NULL),
  ('obstetrics', 4, '090', 'โอปอล', 5, 7, NULL),
  ('obstetrics', 5, '146', 'อ๋ิง', 4, 7, NULL),
  ('obstetrics', 5, '106', 'พิม', 5, 7, NULL),
  ('obstetrics', 6, '084', 'พ้นั ช์', 5, 7, NULL),
  ('obstetrics', 6, '088', 'ปาล์มม่ี', 4, 7, NULL),
  ('obstetrics', 6, '014', 'ปิยะ', 4, 7, NULL),
  ('obstetrics', 7, '023', 'เจ๋เจ้', 4, 7, NULL),
  ('obstetrics', 7, '040', 'มินน่ี', 5, 7, NULL),
  ('obstetrics', 8, '024', 'เรนน่ี', 5, 7, NULL),
  ('obstetrics', 8, '094', 'แบม', 4, 7, NULL),
  ('obstetrics', 9, '010', 'เมย์', 5, 7, NULL),
  ('obstetrics', 9, '026', 'เอม', 4, 7, NULL),
  ('obstetrics', 10, '069', 'คลีน', 5, 7, NULL),
  ('obstetrics', 10, '114', 'ฝ้าย', 5, 7, NULL),
  ('obstetrics', 11, '025', 'ต้นน  า', 4, 7, NULL),
  ('obstetrics', 11, '088', 'ตะวัน', 5, 7, NULL),
  ('obstetrics', 12, '033', 'บลู', 4, 7, NULL),
  ('obstetrics', 13, '036', 'โฟกัส', 4, 7, NULL),
  ('obstetrics', 13, '118', 'ซีซี', 5, 7, NULL),
  ('obstetrics', 14, '097', 'พิมพ์', 4, 7, NULL),
  ('obstetrics', 14, '134', 'มอ่ น', 4, 7, NULL),
  ('internal-medicine', 1, '128', 'เบนซ์', 4, 7, NULL),
  ('internal-medicine', 1, '021', 'ไพรซ์', 4, 7, NULL),
  ('internal-medicine', 1, '109', 'เมเม่', 5, 7, NULL),
  ('internal-medicine', 2, '011', 'ซิ่วซิ่ว', 5, 7, NULL),
  ('internal-medicine', 2, '105', 'ฟางข้าว', 5, 7, NULL),
  ('internal-medicine', 3, '140', 'สลิล', 5, 7, NULL),
  ('internal-medicine', 3, '071', 'เทพ', 5, 7, NULL),
  ('internal-medicine', 4, '111', 'โฟกัส', 4, 7, NULL),
  ('internal-medicine', 4, '100', 'แบม', 4, 7, NULL),
  ('internal-medicine', 5, '162', 'มาร์ค', 5, 7, NULL),
  ('internal-medicine', 5, '037', 'นีร', 5, 7, NULL),
  ('internal-medicine', 5, '038', 'ล่ี', 4, 7, NULL),
  ('ophthalmology', 1, '105', 'ฟางข้าว', 5, 7, NULL),
  ('ophthalmology', 1, '084', 'เต็มเป่ยี ม', 4, 7, NULL),
  ('ophthalmology', 2, '106', 'โนริ', 4, 7, NULL),
  ('ophthalmology', 2, '144', 'ปาน', 5, 7, NULL),
  ('ophthalmology', 3, '032', 'แบม', 4, 7, NULL),
  ('ophthalmology', 3, '138', 'ครีม', 5, 7, NULL),
  ('ophthalmology', 4, '085', 'โอเปิล', 5, 7, NULL),
  ('ophthalmology', 4, '126', 'แก้ม', 4, 7, NULL),
  ('ophthalmology', 5, '052', 'นีร', 5, 7, NULL),
  ('ophthalmology', 5, '133', 'กอล์ฟ', 4, 7, NULL),
  ('ophthalmology', 6, '141', 'ข้าวสวย', 5, 7, NULL),
  ('ophthalmology', 6, '077', 'ใบบัว', 5, 7, NULL),
  ('ophthalmology', 7, '084', 'พ้นั ช์', 5, 7, NULL),
  ('ophthalmology', 7, '081', 'แช็ป', 4, 7, NULL),
  ('ophthalmology', 8, '118', 'มิ้นท์', 4, 7, NULL),
  ('ophthalmology', 8, '042', 'ฟักแฟง', 4, 7, NULL),
  ('ophthalmology', 9, '115', 'ฟีฟ่า', 5, 7, NULL),
  ('ophthalmology', 9, '068', 'เจ้านาย', 5, 7, NULL),
  ('ophthalmology', 10, '006', 'ไอซ์', 4, 7, NULL),
  ('ophthalmology', 10, '034', 'อลิน', 4, 7, NULL),
  ('ophthalmology', 11, '136', 'ตุล', 5, 7, NULL),
  ('ophthalmology', 11, '154', 'เฟิร์ส', 4, 7, NULL),
  ('ophthalmology', 12, '129', 'ซันน่ี', 4, 7, NULL),
  ('ophthalmology', 12, '057', 'นโม', 5, 7, NULL),
  ('ophthalmology', 13, '088', 'ตะวัน', 5, 7, NULL),
  ('ophthalmology', 13, '036', 'มุก', 5, 7, NULL),
  ('ophthalmology', 14, '005', 'กัน', 4, 7, NULL),
  ('ophthalmology', 14, '110', 'จีน', 4, 7, NULL),
  ('medical-records', 1, '010', 'เมย์', 5, 7, NULL),
  ('medical-records', 1, '026', 'เอม', 4, 7, NULL),
  ('medical-records', 1, '082', 'ปริม', 4, 7, NULL),
  ('medical-records', 1, '103', 'เนปจูน', 4, 7, NULL),
  ('medical-records', 2, '065', 'อะตอม', 5, 7, NULL),
  ('medical-records', 2, '128', 'เบนซ์', 4, 7, NULL),
  ('medical-records', 3, '106', 'โนริ', 4, 7, NULL),
  ('medical-records', 3, '065', 'จีน', 4, 7, NULL),
  ('medical-records', 4, '065', 'จีน', 4, 7, NULL),
  ('medical-records', 5, '100', 'ไป๊ป์', 5, 7, NULL),
  ('medical-records', 5, '030', 'ต้นไผ่', 5, 7, NULL),
  ('emergency', 1, '063', 'บิ้ม', 4, 7, NULL),
  ('emergency', 1, '142', 'ไกว', 5, 7, NULL),
  ('emergency', 2, '075', 'ป่าน', 4, 7, NULL),
  ('emergency', 2, '102', 'เอม', 4, 7, NULL),
  ('emergency', 3, '025', 'ต้นน  า', 4, 7, NULL),
  ('emergency', 3, '038', 'เกรซ', 5, 7, NULL),
  ('emergency', 4, '086', 'จีโน่', 4, 7, NULL),
  ('emergency', 4, '149', 'เจนน่ี', 5, 7, NULL),
  ('emergency', 5, '134', 'มอ่ น', 4, 7, NULL),
  ('emergency', 5, '091', 'มีมี', 4, 7, NULL),
  ('emergency', 6, '024', 'ชนา', 4, 7, NULL),
  ('emergency', 6, '008', 'บุ๋น', 4, 7, NULL),
  ('emergency', 7, '036', 'โฟกัส', 4, 7, NULL),
  ('emergency', 7, '141', 'ฝ้าย', 4, 7, NULL),
  ('emergency', 8, '059', 'บูม', 4, 7, NULL),
  ('emergency', 8, '131', 'บิวต้ี', 4, 7, NULL),
  ('emergency', 9, '041', 'เปร้ยี ว', 4, 7, NULL),
  ('emergency', 9, '114', 'จีโอ', 4, 7, NULL),
  ('emergency', 10, '142', 'เจ', 4, 7, NULL),
  ('emergency', 10, '096', 'นาย', 4, 7, NULL),
  ('emergency', 11, '105', 'บ๊ะจ่าง', 4, 7, NULL),
  ('emergency', 11, '031', 'เอม', 4, 7, NULL),
  ('emergency', 12, '058', 'หลิง', 4, 7, NULL),
  ('emergency', 12, '083', 'มิ้ม', 4, 7, NULL),
  ('emergency', 13, '135', 'ยูนีค', 4, 7, NULL),
  ('emergency', 13, '013', 'แตงกวา', 4, 7, NULL),
  ('emergency', 14, '135', 'ยูนีค', 4, 7, NULL),
  ('emergency', 14, '013', 'แตงกวา', 4, 7, NULL),
  ('alternative-medicine', 1, '112', 'ภาณุ', 4, 7, NULL),
  ('alternative-medicine', 1, '073', 'พีช', 4, 7, NULL),
  ('alternative-medicine', 2, '001', 'เบลล์', 4, 7, NULL),
  ('alternative-medicine', 2, '118', 'มิ้นท์', 4, 7, NULL),
  ('alternative-medicine', 3, '077', 'ฝัน', 4, 7, NULL),
  ('alternative-medicine', 3, '121', 'เยจิน', 4, 7, NULL),
  ('alternative-medicine', 4, '014', 'ปิยะ', 4, 7, NULL),
  ('alternative-medicine', 4, '048', 'คิว', 4, 7, NULL),
  ('alternative-medicine', 5, '057', 'พอย', 4, 7, NULL),
  ('alternative-medicine', 5, '077', 'ฝัน', 4, 7, NULL),
  ('rehabilitation', 1, '001', 'เบลล์', 4, 7, NULL),
  ('rehabilitation', 1, '140', 'พ้นั ช์', 4, 7, NULL),
  ('rehabilitation', 2, '082', 'ปริม', 4, 7, NULL),
  ('rehabilitation', 2, '136', 'แวนด้า', 4, 7, NULL),
  ('rehabilitation', 4, '042', 'ฟักแฟง', 4, 7, NULL),
  ('rehabilitation', 4, '112', 'ภาณุ', 4, 7, NULL),
  ('rehabilitation', 5, '042', 'ฟักแฟง', 4, 7, NULL),
  ('rehabilitation', 5, '112', 'ภาณุ', 4, 7, NULL),
  ('operating-room', 1, '055', 'เดือน', 5, 7, NULL),
  ('operating-room', 1, '136', 'แวนด้า', 4, 7, NULL),
  ('operating-room', 2, '152', 'พลอย', 5, 7, NULL),
  ('operating-room', 2, '079', 'ป่นิ', 4, 7, NULL),
  ('operating-room', 3, '152', 'ซัน', 4, 7, NULL),
  ('operating-room', 3, '064', 'มอ่ นแก้ว', 5, 7, NULL),
  ('operating-room', 4, '061', 'ยูโกะ', 5, 7, NULL),
  ('operating-room', 4, '121', 'เยจิน', 4, 7, NULL),
  ('operating-room', 5, '147', 'ปัน', 4, 7, NULL),
  ('operating-room', 5, '132', 'เจได', 5, 7, NULL),
  ('pharmacy', 1, '031', 'แก้ม', 5, 7, NULL),
  ('pharmacy', 1, '021', 'ไพรซ์', 4, 7, NULL),
  ('pharmacy', 2, '138', 'การ์ฟิลด์', 4, 7, NULL),
  ('pharmacy', 3, '020', 'ตะวัน', 4, 7, NULL),
  ('pharmacy', 4, '033', 'บลู', 4, 7, NULL),
  ('pharmacy', 5, '037', 'ภาคิน', 4, 7, NULL),
  ('pharmacy', 5, '122', 'ปอง', 4, 7, NULL),
  ('pharmacy', 6, '113', 'การ์ฟิลด์', 4, 7, NULL),
  ('pharmacy', 7, '110', 'จีน', 4, 7, NULL),
  ('pharmacy', 7, '002', 'ก๊ิม', 4, 7, NULL),
  ('pharmacy', 8, '120', 'เดียร์', 4, 7, NULL),
  ('pharmacy', 10, '072', 'ส้ม', 4, 7, NULL),
  ('pharmacy', 11, '074', 'ฟ้า', 4, 7, NULL),
  ('pharmacy', 12, '095', 'หงา', 5, 7, NULL),
  ('pharmacy', 13, '047', 'สตังค์', 4, 7, NULL),
  ('ccu', 1, '152', 'พลอย', 5, 7, NULL),
  ('ccu', 1, '142', 'เจ', 4, 7, NULL),
  ('ccu', 2, '109', 'เมเม่', 5, 7, NULL),
  ('ccu', 2, '142', 'ไกว', 5, 7, NULL),
  ('ccu', 3, '114', 'ฝ้าย', 5, 7, NULL),
  ('ccu', 3, '090', 'โอปอล', 5, 7, NULL),
  ('ccu', 4, '096', 'นาย', 4, 7, NULL),
  ('ccu', 4, '020', 'ตะวัน', 4, 7, NULL),
  ('ccu', 5, '003', 'สุดเขต', 5, 7, NULL),
  ('ccu', 5, '117', 'มด', 4, 7, NULL),
  ('ccu', 6, '022', 'มดแดง', 4, 7, NULL),
  ('ccu', 6, '092', 'พิณ', 5, 7, NULL),
  ('ccu', 7, '031', 'แก้ม', 5, 7, NULL),
  ('ccu', 8, '102', 'เอม', 4, 7, NULL),
  ('ccu', 8, '031', 'เอม', 4, 7, NULL),
  ('ccu', 9, '086', 'จีโน่', 4, 7, NULL),
  ('ccu', 9, '038', 'ล่ี', 4, 7, NULL),
  ('ccu', 10, '114', 'จีโอ', 4, 7, NULL),
  ('ccu', 10, '083', 'มิ้ม', 4, 7, NULL),
  ('ccu', 11, '046', 'นาเนย', 5, 7, NULL),
  ('ccu', 11, '062', 'แบม', 5, 7, NULL),
  ('ccu', 12, '099', 'มะนาว', 4, 7, NULL),
  ('ccu', 12, '010', 'กัญ', 4, 7, NULL),
  ('ccu', 12, '039', 'อิง', 4, 7, NULL),
  ('pr-vdo', 1, '070', 'โฟกัส', 4, 7, NULL),
  ('pr-vdo', 2, '140', 'พ้นั ช์', 4, 7, NULL),
  ('pr-vdo', 3, '082', 'ปริม', 4, 7, NULL),
  ('pr-vdo', 5, '100', 'แบม', 4, 7, NULL),
  ('aquatic', 2, '062', 'แบม', 5, 7, NULL);

-- Sanity: row count
DO $$
DECLARE n INT;
BEGIN
  SELECT COUNT(*) INTO n FROM _final_2569;
  IF n <> 290 THEN
    RAISE EXCEPTION 'staged row count % does not match expected 290', n;
  END IF;
END $$;

-- Step 2: UPDATE matching rows — sync days_practiced + notes, preserve everything else
UPDATE public.vettobe_assignments a
SET
  days_practiced = f.days_practiced,
  notes = CASE
    WHEN f.days_note IS NOT NULL
      THEN COALESCE(NULLIF(a.notes, ''), '') ||
           CASE WHEN COALESCE(NULLIF(a.notes, ''), '') = '' THEN '' ELSE ' | ' END ||
           '[FINAL 5/19: ' || f.days_note || ']'
    ELSE a.notes
  END
FROM _final_2569 f
WHERE a.year_id = 2569
  AND a.dept_slug = f.dept_slug
  AND a.week = f.week
  AND a.short_id = f.short_id
  AND a.student_year = f.student_year;

-- Step 3: INSERT FINAL rows missing in DB.
--         For each new row, look up canonical nickname + full_name from any
--         existing row of the same student (matching short_id + year only)
--         to avoid carrying over PDF-extracted diacritic-reorder corruption.
INSERT INTO public.vettobe_assignments
  (id, year_id, dept_slug, week, short_id, nickname, full_name, student_year, days_practiced, rank, source, notes)
SELECT
  gen_random_uuid(),
  2569,
  f.dept_slug,
  f.week,
  f.short_id,
  COALESCE(
    (SELECT nickname FROM public.vettobe_assignments
       WHERE year_id = 2569 AND short_id = f.short_id AND student_year = f.student_year
       ORDER BY length(nickname) DESC, nickname LIMIT 1),
    f.nickname
  ),
  (SELECT MAX(full_name) FROM public.vettobe_assignments
     WHERE year_id = 2569 AND short_id = f.short_id AND student_year = f.student_year),
  f.student_year,
  f.days_practiced,
  'manual',
  'verified-self-report',
  CASE WHEN f.days_note IS NOT NULL
       THEN 'inserted from FINAL grid 5/19 — ' || f.days_note
       ELSE 'inserted from FINAL grid 5/19' END
FROM _final_2569 f
WHERE NOT EXISTS (
  SELECT 1 FROM public.vettobe_assignments a
  WHERE a.year_id = 2569
    AND a.dept_slug = f.dept_slug
    AND a.week = f.week
    AND a.short_id = f.short_id
    AND a.student_year = f.student_year
);

-- Step 4: DELETE DB rows not present in FINAL
DELETE FROM public.vettobe_assignments a
WHERE a.year_id = 2569
  AND NOT EXISTS (
    SELECT 1 FROM _final_2569 f
    WHERE a.dept_slug = f.dept_slug
      AND a.week = f.week
      AND a.short_id = f.short_id
      AND a.student_year = f.student_year
  );

-- Step 5: Refresh year stats
WITH stats AS (
  SELECT COUNT(*) AS slots,
         COUNT(DISTINCT (short_id, nickname, student_year)) AS students
  FROM public.vettobe_assignments
  WHERE year_id = 2569
)
UPDATE public.vettobe_years y
SET total_slots = s.slots,
    unique_students = s.students,
    updated_at = now()
FROM stats s
WHERE y.id = 2569;

-- Final sanity verification — should be 290 total
DO $$
DECLARE n INT;
BEGIN
  SELECT COUNT(*) INTO n FROM public.vettobe_assignments WHERE year_id = 2569;
  IF n <> 290 THEN
    RAISE EXCEPTION 'post-sync row count % does not match expected 290', n;
  END IF;
END $$;

COMMIT;
