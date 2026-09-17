import re

# Fix AdminView.tsx
with open('src/components/Admin/AdminView.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace(
    "PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',",
    "PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',\n      REJECTED: 'REJECTED',"
)
with open('src/components/Admin/AdminView.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

# Fix LiveStatusTracker.tsx
with open('src/components/PillarGovt/LiveStatusTracker.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

if 'AlertTriangle' not in txt:
    txt = txt.replace('import { Search,', 'import { Search, AlertTriangle,')
    # Maybe it imports Search alone?
    txt = txt.replace('import { Search }', 'import { Search, AlertTriangle }')

with open('src/components/PillarGovt/LiveStatusTracker.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

# Fix MandiGateOfficerModal.tsx
with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace(
    "body: JSON.stringify({ token: currentBooking.tokenNumber, payload })",
    "body: JSON.stringify({ token: currentBooking?.tokenNumber, payload })"
)

with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Fixed TS errors")
