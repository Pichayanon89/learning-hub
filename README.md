# คลังสื่อการเรียนรู้ Data Center

เว็บแอปต้นแบบสำหรับจัดคลังสื่อการเรียนรู้ของครูพิชญานนท์ วัจนสุนทร โดยใช้ชุดสื่อจริงบางส่วนของห้อง ป.4/2 ปีการศึกษา 2569 เป็นข้อมูลตั้งต้น

เว็บไซต์: https://pichayanon89.github.io/learning-hub/

## สิ่งที่มีในต้นแบบ

- หน้าแรกสไตล์ Netflix for Education แบบ light theme
- ค้นหาสื่อและกรองตามชั้นปี/ประเภทสื่อ
- การ์ดสื่อแบบเลื่อนแนวนอน พร้อม tag วิดีโอ ใบงาน สไลด์ และเกมการศึกษา
- หน้ารายละเอียดสื่อในหน้าเดียว พร้อม CTA เริ่มบทเรียนและดาวน์โหลดใบงาน
- ส่วนหลังบ้านครูแบบจำลองสำหรับดูสถิติและรายการสื่อ
- โครงสร้าง responsive สำหรับมือถือ แท็บเล็ต และ desktop
- ไฟล์สื่อจริงที่คัดแล้วอยู่ใน `public/learning-media/p4-2`
- ภาพปกรายวิชาอยู่ใน `src/assets/covers` และ export ผ่าน `src/assets/index.js`

## หมายเหตุข้อมูลจริง

คัดเฉพาะสื่อการเรียน/ใบงาน/กิจกรรมเข้าโปรเจกต์ ไม่ได้นำรายชื่อนักเรียน รูปนักเรียน เอกสารประกัน หรือข้อมูลเยี่ยมบ้านเข้าเว็บ

## คำสั่งใช้งาน

```bash
npm install
npm run dev
```

ตรวจคุณภาพ:

```bash
npm run lint
npm run build
```

สำหรับ GitHub Pages ใช้ GitHub Actions ใน `.github/workflows/pages.yml` โดย build เฉพาะ frontend:

```bash
npm run build:static
```

## ตั้งค่าความปลอดภัยหลังบ้าน

Backend ต้องมีค่า environment variables ก่อนใช้งานหลังบ้านจริง:

- `ADMIN_PASSWORD` หรือ `ADMIN_PASSWORD_HASH` สำหรับรหัสผ่านครู
- `AUTH_TOKEN_SECRET` สำหรับเซ็น session token
- `CORS_ORIGINS` ให้คงไว้เฉพาะโดเมนที่อนุญาต เช่น `https://pichayanon89.github.io`

แนะนำให้ใช้ `ADMIN_PASSWORD_HASH` แทนรหัสผ่านตรง ๆ โดยสร้างค่า hash ด้วยคำสั่งนี้:

```bash
node -e "const crypto=require('crypto'); const password=process.argv[1]; const salt=crypto.randomBytes(16).toString('hex'); crypto.scrypt(password,salt,64,(err,key)=>{if(err) throw err; console.log(`${salt}:${key.toString('hex')}`)})" "ใส่รหัสผ่านใหม่ตรงนี้"
```
