const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// خريطة لتخزين آخر وقت نشاط لكل مستخدم (المعرف -> وقت آخر ping)
const activeUsers = new Map();
const TIMEOUT = 70 * 1000; // 70 ثانية مهلة، أطول قليلاً من فترة التحديث لضمان عدم الخروج المبكر

// تنظيف المستخدمين الغير نشطين
function cleanup() {
  const now = Date.now();
  for (const [id, lastSeen] of activeUsers) {
    if (now - lastSeen > TIMEOUT) {
      activeUsers.delete(id);
    }
  }
}

app.set('trust proxy', true); // لاستخراج IP الحقيقي خلف البروكسي (مهم في Render)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/counter', (req, res) => {
  
  let userId = req.query.id;
  if (!userId || userId.trim() === '') {
  
    userId = req.ip || req.connection.remoteAddress;
  }


  activeUsers.set(userId, Date.now());


  cleanup();

  
  res.json({ count: activeUsers.size });
});

app.get('/', (req, res) => {
  res.send('DEDSEC Active Counter Server يعمل ✅');
});

app.listen(PORT, () => {
  console.log(`DEDSEC Server شغال على المنفذ ${PORT}`);
});
