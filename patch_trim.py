import re

with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace(
    'const handleTokenScanned = (tokenText: string) => {',
    'const handleTokenScanned = (tokenText: string) => {\n    tokenText = (tokenText || "").trim().toUpperCase();'
)

with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
