import express from 'express';
import multer from 'multer';
import { db } from './db/index.js';
import { scans } from './db/schema.js';
import { predict } from './predict.js';

const app = express();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.static('public'));

app.get('/api/scans', (_req, res) => {
  res.json(db.select().from(scans).orderBy(scans.id).all());
});

app.post('/api/scans', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image is required' });
  try {
    const result = await predict(req.file.path);
    if (!result.recognized) return res.status(422).json({ error: 'not_recognized' });
    const row = db.insert(scans).values({
      crop: result.crop,
      disease: result.disease,
      healthy: result.healthy,
      confidence: result.confidence,
      thumb: (req.body as { thumb?: string }).thumb ?? null,
      createdAt: new Date().toISOString(),
    }).returning().get();
    res.status(201).json(row);
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'ml_service_unavailable' });
  }
});

app.listen(3000, () => console.log('CropGuard running on port 3000'));
