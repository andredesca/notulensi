# Notulensi Rapat

Deploy ke Netlify:
1. Push folder ini ke GitHub, lalu Netlify > Add new site > Import from Git (atau drag & drop folder di app.netlify.com/drop; fitur AI butuh Git/CLI deploy karena memakai Functions).
2. Site configuration > Environment variables: tambahkan ANTHROPIC_API_KEY (opsional ANTHROPIC_MODEL).
3. Deploy. Tanpa API key, tombol "Ringkas" tetap jalan dengan ringkasan otomatis sederhana.

Dikte suara paling baik di Chrome/Edge (HTTPS, yang otomatis disediakan Netlify).
