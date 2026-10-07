import { readFile } from 'node:fs/promises';

export interface Prediction {
  recognized: boolean;
  crop: string;
  disease: string;
  healthy: boolean;
  confidence: number;
}

// Sends the leaf photo to the Python CNN service and returns its prediction
export async function predict(imagePath: string): Promise<Prediction> {
  const form = new FormData();
  form.append('image', new Blob([await readFile(imagePath)]), 'leaf.jpg');
  const res = await fetch(process.env.ML_URL ?? 'http://localhost:8000/predict', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`ML service error ${res.status}`);
  return (await res.json()) as Prediction;
}
