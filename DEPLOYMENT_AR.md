# دليل النشر على Hostinger باستخدام Docker و Nginx

هذا الدليل يشرح نشر الموقع على الدومين `alisalhab.com` مع البريد المهني `me@alisalhab.com` بطريقة عملية وواضحة.

## 1) مهم جدًا قبل البدء

إذا كانت خطتك في Hostinger هي **Shared Hosting** فقط، فلن تتمكن من تشغيل Docker عادةً.
أنت تحتاج **VPS** أو **Cloud/VPS** حتى تستطيع تثبيت Docker و Nginx والتحكم في المنافذ.

إذا كان لديك VPS بالفعل، أكمل الخطوات التالية.

## 2) ماذا فعلنا في المشروع

أضفنا ملفات النشر التالية:

- `docker-compose.yml` لتشغيل الباكند و Nginx معًا.
- `backend/Dockerfile` لبناء وتشغيل الباكند.
- `Dockerfile` في الجذر لبناء الفرونتند ووضعه داخل Nginx.
- `nginx/default.conf` لإعداد Nginx كواجهة أمامية وعمل reverse proxy إلى الباكند.
- `.dockerignore` لتقليل حجم البناء.

## 3) كيف يعمل النظام بعد النشر

الفكرة بسيطة:

- Nginx يستقبل الزائر على `alisalhab.com`.
- Nginx يرسل ملفات React الثابتة للمستخدم.
- أي طلب يبدأ بـ `/api` يذهب إلى الباكند داخل الشبكة الداخلية للحاويات.

بالتالي المستخدم يرى موقعًا واحدًا فقط، لكن الخلفية مقسمة إلى:

- Frontend: React + Vite
- Backend: Express + TypeScript
- Reverse Proxy: Nginx

## 4) إعداد DNS للدومين

ادخل إلى لوحة تحكم الدومين في Hostinger ثم أضف السجلات التالية:

- `A` record لـ `@` يشير إلى IP الخاص بالسيرفر VPS
- `A` record لـ `www` يشير إلى نفس IP

مثال:

- `@  -> 123.123.123.123`
- `www -> 123.123.123.123`

### لماذا هذا مهم؟

لأن `alisalhab.com` و `www.alisalhab.com` يجب أن يذهبا إلى نفس السيرفر.

## 5) إعداد البريد المهني me@alisalhab.com

البريد المهني لا يشتغل من نفس Docker الخاص بالموقع عادةً، بل من خدمة البريد في Hostinger.

عليك في لوحة Hostinger:

- إنشاء البريد `me@alisalhab.com`
- ضبط سجلات `MX`
- ضبط `SPF`
- ضبط `DKIM`
- ويفضل أيضًا `DMARC`

### لماذا هذا منفصل عن الموقع؟

لأن الموقع شيء، والبريد شيء آخر. قد يشاركان نفس الدومين، لكن البريد يحتاج سجلات DNS خاصة به حتى تصل الرسائل ولا تذهب إلى spam.

## 6) المتغيرات المطلوبة

أنشئ ملفًا اسمه `.env` في الجذر على السيرفر، وضع فيه القيم التالية:

```env
PORT=5000
NODE_ENV=production
ADMIN_PASSWORD=ضع_كلمة_سر_الإدارة
JWT_SECRET=مفتاح_سري_قوي_وطويل_جدا
FRONTEND_URL=https://alisalhab.com
```

### شرح كل قيمة

- `PORT=5000`: المنفذ الداخلي للباكند.
- `NODE_ENV=production`: يخبر التطبيق أنه يعمل في بيئة إنتاج.
- `ADMIN_PASSWORD`: كلمة مرور لوحة الإدارة.
- `JWT_SECRET`: مفتاح التوقيع للتوكنات.
- `FRONTEND_URL`: الدومين الذي سيفتح عليه الموقع.

## 7) تثبيت Docker على VPS

على خادم Ubuntu مثلًا:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

## 8) تشغيل المشروع

بعد رفع الملفات إلى السيرفر:

```bash
docker compose up -d --build
```

### ماذا يفعل هذا الأمر؟

- يبني صورة الباكند
- يبني صورة Nginx مع الفرونتند
- يشغل الحاويتين في الخلفية

## 9) كيف يعمل Nginx هنا

ملف الإعداد الموجود في `nginx/default.conf` يقوم بـ:

- استقبال الطلبات على المنفذ 80
- تقديم ملفات الواجهة الأمامية
- تمرير `/api/*` إلى الباكند عبر اسم الخدمة `backend`

هذا يسمى **reverse proxy**.

### معنى reverse proxy

الزائر لا يتصل مباشرة بالباكند، بل يتصل بـ Nginx، وNginx يقرر أين يرسل كل طلب.

## 10) ماذا عن HTTPS

بعد أن يعمل الموقع بنجاح على HTTP، فعّل SSL.

أمامك طريقتان:

1. استخدام SSL من Hostinger إذا كان متاحًا على VPS أو من لوحة التحكم.
2. استخدام `certbot` للحصول على شهادة Let’s Encrypt.

### الأفضل

إذا كنت مرتاحًا لإدارة السيرفر، استخدم Let’s Encrypt.
إذا أردت الأسهل، استخدم SSL من Hostinger إن كان مدعومًا في خطتك.

## 11) لماذا عدّلنا CORS في الباكند

أضفت في الباكند قبول الدومين الأساسي ونسخة `www` أيضًا، حتى لا تظهر مشاكل عند فتح الموقع من أي نسخة من الدومين.

## 12) فحص التشغيل

بعد التشغيل، جرّب هذه الأوامر:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f nginx
```

### ما الذي تبحث عنه؟

- هل الحاويتان تعملان؟
- هل الباكند بدأ بدون أخطاء؟
- هل Nginx استقبل الطلبات؟

## 13) أين تُحفظ البيانات؟

ملف `backend/data/portfolio.json` موجود داخل مجلد ثابت ومربوط بvolume في Docker.

هذا مهم لأن:

- صورك
- السيرة الذاتية
- بيانات البروفايل

يجب ألا تضيع عند إعادة تشغيل الحاوية.

## 14) ماذا تفعل إذا أردت تحديث الموقع لاحقًا؟

كل مرة تغيّر فيها الكود:

```bash
docker compose up -d --build
```

إذا غيّرت فقط البيانات داخل `portfolio.json`، غالبًا لن تحتاج إلا إلى إعادة تشغيل الحاوية أو حفظ الملف إن كنت تعدله على السيرفر.

## 15) ملخص سريع جدًا

1. تحتاج VPS، وليس Shared Hosting.
2. تضبط DNS للدومين.
3. تنشئ `.env`.
4. تشغل `docker compose up -d --build`.
5. تضبط HTTPS.
6. تضبط البريد عبر MX/SPF/DKIM/DMARC.
