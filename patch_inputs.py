with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace(
    "onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\\s]/g, ''))}",
    "onChange={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z\\s]/g, ''); setName(e.target.value); }}"
)

txt = txt.replace(
    "onChange={(e) => { setRegPhone(e.target.value.replace(/\\D/g, '')); setError(''); }}",
    "onChange={(e) => { e.target.value = e.target.value.replace(/\\D/g, ''); setRegPhone(e.target.value); setError(''); }}"
)

txt = txt.replace(
    "onChange={(e) => { setAadhaar(e.target.value.replace(/\\D/g, '')); setError(''); }}",
    "onChange={(e) => { e.target.value = e.target.value.replace(/\\D/g, ''); setAadhaar(e.target.value); setError(''); }}"
)

with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Applied strict DOM input override.")
