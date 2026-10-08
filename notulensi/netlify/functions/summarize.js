// Netlify Function: meringkas catatan rapat dengan Claude.
// Atur environment variable ANTHROPIC_API_KEY di Netlify (Site configuration > Environment variables).
exports.handler = async (event) => {
  const json = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(500, { error: 'ANTHROPIC_API_KEY belum diatur' });

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Request tidak valid' }); }
  const notes = String(b.notes || '').slice(0, 60000);
  if (notes.trim().length < 20) return json(400, { error: 'Catatan terlalu pendek' });

  const prompt = `Rapat: ${b.title || '(tanpa judul)'}
Tanggal: ${b.date || '-'}
Peserta: ${b.people || '-'}

Catatan / transkrip:
${notes}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 1500,
        system: 'Kamu penyusun notulensi rapat. Tulis dalam Bahasa Indonesia yang ringkas dan faktual; jangan menambah hal yang tidak ada di catatan. Balas HANYA dengan JSON: {"ringkasan": string (2-5 kalimat), "keputusan": string[], "tindak_lanjut": string[] (sertakan penanggung jawab dan tenggat jika disebut)}.',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!r.ok) return json(502, { error: 'Gagal menghubungi layanan AI' });
    const data = await r.json();
    const text = (data.content || []).map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
    const out = JSON.parse(text);
    return json(200, {
      ringkasan: String(out.ringkasan || ''),
      keputusan: Array.isArray(out.keputusan) ? out.keputusan.map(String) : [],
      tindak_lanjut: Array.isArray(out.tindak_lanjut) ? out.tindak_lanjut.map(String) : []
    });
  } catch (e) {
    return json(500, { error: 'Gagal memproses ringkasan' });
  }
};
