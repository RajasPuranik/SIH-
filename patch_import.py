import re

with open('src/components/PillarGovt/LiveStatusTracker.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace('Search,', 'Search, AlertTriangle,')

with open('src/components/PillarGovt/LiveStatusTracker.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Added AlertTriangle")
