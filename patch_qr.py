import re

with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

patch = """  const handleTokenScanned = (tokenText: string) => {
    tokenText = (tokenText || "").trim().toUpperCase();
    
    // If it's a URL from the QR code (e.g. https://kisantrack.vercel.app/?scan=KT-MP-2026-1234)
    if (tokenText.includes('SCAN=')) {
      const match = tokenText.match(/SCAN=(KT-[A-Z0-9-]+)/);
      if (match && match[1]) {
        tokenText = match[1];
      }
    } else if (tokenText.includes('KT-')) {
      const match = tokenText.match(/(KT-[A-Z0-9-]+)/);
      if (match && match[1]) {
        tokenText = match[1];
      }
    }

    let booking = bookingsRef.current.find(b => b.tokenNumber === tokenText || b.id === tokenText);"""

txt = txt.replace(
    """  const handleTokenScanned = (tokenText: string) => {
    tokenText = (tokenText || "").trim().toUpperCase();
    let booking = bookingsRef.current.find(b => b.tokenNumber === tokenText || b.id === tokenText);""",
    patch
)

with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Fixed QR scanning URL parsing")
