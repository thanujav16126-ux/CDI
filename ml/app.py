import io, json, os
import numpy as np
from fastapi import FastAPI, File, UploadFile
from PIL import Image

if not (os.path.exists('cropguard_model.keras') and os.path.exists('labels.json')):
    raise SystemExit('Missing ml/cropguard_model.keras and ml/labels.json. Train them in Google Colab first (see README).')

import tensorflow as tf
app = FastAPI()
model = tf.keras.models.load_model('cropguard_model.keras')
labels = json.load(open('labels.json'))
MIN_CONF = 0.60  # below this the app says "not recognized"
CROP_NAMES = {'Pepper, bell': 'Bell Pepper', 'Corn (maize)': 'Corn (Maize)', 'Orange': 'Citrus'}

def split_label(raw):
    crop, _, disease = raw.partition('___')
    crop = crop.replace('_', ' ').strip()
    return CROP_NAMES.get(crop, crop), disease.replace('_', ' ').strip()

@app.post('/predict')
async def predict(image: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await image.read())).convert('RGB').resize((224, 224))
    x = np.expand_dims(np.array(img, dtype='float32'), 0)  # raw 0-255 pixels
    probs = model.predict(x, verbose=0)[0]
    best = int(np.argmax(probs))
    crop, disease = split_label(labels[best])
    conf = float(probs[best])
    return {'recognized': conf >= MIN_CONF, 'crop': crop, 'disease': disease,
            'healthy': disease.lower() == 'healthy', 'confidence': round(conf * 100)}
