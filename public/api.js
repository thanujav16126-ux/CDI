/* Connects the page to the Express API. The AI model reads the photo, so there is no crop dropdown. */
$('scan-crop-select').parentElement.style.display = 'none';
document.querySelectorAll('p').forEach(p => { if (/sample leaf presets/i.test(p.textContent)) p.parentElement.style.display = 'none'; });
presetScan = function () { alert('Please upload a real leaf photo. The AI model reads the photo itself.'); };

const norm = s => s.toLowerCase().replace(/[^a-z]/g, '');
function diseaseIndex(crop, name, healthy) {
  const i = dis.findIndex(d => norm(d.crop) === norm(crop) && (norm(name) === norm(d.name) || norm(name).includes(norm(d.name))));
  if (i >= 0) return i;
  dis.push({ id: dis.length, crop, name: healthy ? 'Healthy' : name, sev: healthy ? 'Low' : 'Medium',
    desc: healthy ? 'No disease detected on this leaf.' : 'Detected by the AI model from the leaf photo.',
    treat: healthy ? 'No treatment needed.' : 'Consult a local agriculture officer for the right treatment.',
    prev: 'Keep the field clean, avoid overwatering and rotate crops.' });
  return dis.length - 1;
}
const toRecord = x => ({ id: x.id, disease: diseaseIndex(x.crop, x.disease, x.healthy), crop: x.crop,
  conf: x.confidence, date: x.createdAt.slice(0, 10), img: x.thumb });

(async () => {
  try {
    const rows = await (await fetch('/api/scans')).json();
    history.length = 0; rows.forEach(x => history.push(toRecord(x)));
    $('total-scans-count').textContent = history.length;
  } catch (e) { console.error(e); }
})();
save = function () { $('total-scans-count').textContent = history.length; };

runDiagnosis = async function () {
  const f = file, t = thumb, box = $('scan-result-card');
  box.classList.remove('hidden');
  const fail = (title, msg) => { box.className = 'mt-6 p-5 rounded-2xl border bg-rose-50 border-rose-200 text-sm';
    box.innerHTML = `<h3 class="font-bold text-rose-700">${title}</h3><p class="text-xs text-rose-600 mt-1">${msg}</p>`; };
  if (!f) return fail('No photo', 'Please upload a leaf photo first.');
  box.className = 'mt-6 p-5 rounded-2xl border bg-slate-50 border-slate-200 text-sm text-slate-600';
  box.innerHTML = 'Analyzing leaf…';
  const fd = new FormData(); fd.append('image', f); if (t) fd.append('thumb', t);
  let res = null;
  try { res = await fetch('/api/scans', { method: 'POST', body: fd }); } catch (e) {}
  if (!res) return fail('Server not reachable', 'Make sure the server is running.');
  if (res.status === 422) return fail('Plant not recognized', 'The AI is not confident about this leaf. Try a clear, close photo of a single leaf.');
  if (!res.ok) return fail('Analysis failed', 'Is the Python ML service running on port 8000?');
  const rec = toRecord(await res.json()), d = dis[rec.disease];
  history.push(rec); save();
  box.className = 'mt-6 p-5 rounded-2xl border bg-brand-50 border-brand-100';
  box.innerHTML = `<div class="flex items-center justify-between"><div><p class="text-xs text-slate-500">${emoji[d.crop] || '🌱'} ${d.crop}</p><h3 class="text-lg font-bold text-slate-900">${d.name}</h3></div><div class="text-right"><p class="text-2xl font-black text-brand-600">${rec.conf}%</p><p class="text-[10px] text-slate-500">confidence</p></div></div><p class="text-sm text-slate-600 mt-3">${d.desc}</p><button onclick="showScan(${rec.id})" class="mt-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl">View treatment &amp; prevention</button>`;
};
