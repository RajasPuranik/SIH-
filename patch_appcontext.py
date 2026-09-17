import re

with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

replacement = """              let nextStatus = 'IN_TRANSIT';
              let remarks = 'Token verified. Proceeding to Transit.';
              let officer = 'APMC Dispatch Officer';
              let updatedQuantity = b.estimatedQuantityQuintals;
              
              if (b.status === 'BOOKED') {
                nextStatus = 'IN_TRANSIT';
                remarks = 'Token verified. Proceeding to Mandi Gate.';
                officer = 'APMC Dispatch Officer';
              } else if (b.status === 'IN_TRANSIT') {
                nextStatus = 'ARRIVED_AT_GATE';
                remarks = 'Arrived at Gate 3.';
                officer = 'APMC Entry Officer';
              } else if (b.status === 'ARRIVED_AT_GATE') {
                if (data.payload && data.payload.rejected) {
                  nextStatus = 'REJECTED';
                  remarks = `Your crop doesn't meet the required standards. Token expired. (Moisture: ${data.payload.moisture}%, Broken: ${data.payload.brokenGrains}%)`;
                  officer = 'APMC Quality Assay';
                } else if (data.payload && data.payload.moisture) {
                  nextStatus = 'QUALITY_VERIFIED';
                  remarks = `Moisture ${data.payload.moisture}%, Grade-A verified`;
                  officer = 'APMC Quality Assay';
                  if (data.payload.actualWeight) {
                    updatedQuantity = parseFloat(data.payload.actualWeight);
                  }
                } else {
                  nextStatus = 'QUALITY_VERIFIED';
                  remarks = 'Moisture 11.5%, Grade-A verified';
                  officer = 'APMC Quality Assay';
                }
              } else if (b.status === 'QUALITY_VERIFIED') {
                nextStatus = 'WEIGHED';
                remarks = `Gross ${(updatedQuantity * 100) + 2700}kg, Tare 2700kg. Net: ${updatedQuantity} Qtl`;
                officer = 'Weighbridge Operator';
              } else if (b.status === 'WEIGHED') {
                nextStatus = 'PAYMENT_COMPLETED';
                remarks = 'PFMS DBT Payment Cleared';
                officer = 'Treasury Officer';
              }"""

# Replace in AppContext.tsx
import re

old_block = r"""              let nextStatus = 'IN_TRANSIT';
              let remarks = 'Token verified. Proceeding to Transit.';
              let officer = 'APMC Dispatch Officer';
              
              if \(b.status === 'BOOKED'\) \{
                nextStatus = 'IN_TRANSIT';
                remarks = 'Token verified. Proceeding to Mandi Gate.';
                officer = 'APMC Dispatch Officer';
              \} else if \(b.status === 'IN_TRANSIT'\) \{
                nextStatus = 'ARRIVED_AT_GATE';
                remarks = 'Arrived at Gate 3.';
                officer = 'APMC Entry Officer';
              \} else if \(b.status === 'ARRIVED_AT_GATE'\) \{
                nextStatus = 'QUALITY_VERIFIED';
                remarks = 'Moisture 11.5%, Grade-A verified';
                officer = 'APMC Quality Assay';
              \} else if \(b.status === 'QUALITY_VERIFIED'\) \{
                nextStatus = 'WEIGHED';
                remarks = 'Gross 9200kg, Tare 2700kg. Net: 65 Qtl';
                officer = 'Weighbridge Operator';
              \} else if \(b.status === 'WEIGHED'\) \{
                nextStatus = 'PAYMENT_COMPLETED';
                remarks = 'PFMS DBT Payment Cleared';
                officer = 'Treasury Officer';
              \}"""

txt = re.sub(old_block, replacement, txt)

# Also we need to ensure updatedQuantity is saved into the booking!
# Look at how the booking is updated
#                 ...b,
#                 status: nextStatus as SlotStatus,
#                 tokenNumber: newToken,
#                 statusHistory: updatedHistory,

update_block_old = r"""                \.\.\.b,
                status: nextStatus as SlotStatus,
                tokenNumber: newToken,
                statusHistory: updatedHistory,"""
update_block_new = """                ...b,
                status: nextStatus as SlotStatus,
                tokenNumber: nextStatus === 'REJECTED' ? b.tokenNumber : newToken,
                estimatedQuantityQuintals: updatedQuantity,
                statusHistory: updatedHistory,"""

txt = re.sub(update_block_old, update_block_new, txt)

with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Patched AppContext.tsx for Assay logic")
