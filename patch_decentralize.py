import re

with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. We'll add a helper function in MandiGateOfficerModal.tsx later. Let's look at updateBookingStatus in AppContext.tsx
txt = txt.replace(
    "updateBookingStatus: (id: string, newStatus: SlotStatus, remarks?: string, officerName?: string, skipBroadcast?: boolean) => void;",
    "updateBookingStatus: (id: string, newStatus: SlotStatus, remarks?: string, officerName?: string, skipBroadcast?: boolean, extraData?: any) => void;"
)

func_def_old = r"""  const updateBookingStatus = \(
    id: string,
    newStatus: SlotStatus,
    remarks: string = '',
    officerName\?: string,
    skipBroadcast: boolean = false
  \) => \{"""
  
func_def_new = """  const updateBookingStatus = (
    id: string,
    newStatus: SlotStatus,
    remarks: string = '',
    officerName?: string,
    skipBroadcast: boolean = false,
    extraData?: any
  ) => {"""
  
txt = re.sub(func_def_old, func_def_new, txt)

# Inside updateBookingStatus, apply extraData
update_booking_old = r"const updatedBooking = \{ \.\.\.booking, status: newStatus, statusHistory: updatedHistory \};"
update_booking_new = "const updatedBooking = { ...booking, status: newStatus, statusHistory: updatedHistory, ...(extraData || {}) };"
txt = re.sub(update_booking_old, update_booking_new, txt)

with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

# Now, MandiGateOfficerModal.tsx
with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'r', encoding='utf-8') as f:
    modal_txt = f.read()

modal_txt = modal_txt.replace(
    "const { isOfficerScannerOpen, setIsOfficerScannerOpen, bookings, createBooking, playFeedbackTone, activePillar } = useApp();",
    "const { isOfficerScannerOpen, setIsOfficerScannerOpen, bookings, createBooking, playFeedbackTone, activePillar, updateBookingStatus } = useApp();"
)

# Replace handleAssaySubmit fetch
fetch_assay_old = r"""    fetch\(`\$\{API_BASE\}/api/scan-trigger`, \{
      method: 'POST',
      headers: \{ 'Content-Type': 'application/json' \},
      body: JSON\.stringify\(\{ token: currentBooking\?\.tokenNumber, payload \}\)
    \}\)\.catch\(\(\) => \{\}\);"""

fetch_assay_new = """    if (currentBooking) {
      if (payload.rejected) {
        updateBookingStatus(
          currentBooking.id, 
          'REJECTED' as any, 
          `Your crop doesn't meet the required standards. Token expired. (Moisture: ${payload.moisture}%, Broken: ${payload.brokenGrains}%)`, 
          'APMC Quality Assay', 
          false
        );
      } else {
        updateBookingStatus(
          currentBooking.id, 
          'QUALITY_VERIFIED', 
          `Moisture ${payload.moisture}%, Grade-A verified`, 
          'APMC Quality Assay', 
          false, 
          { estimatedQuantityQuintals: parseFloat(actualWeight) }
        );
      }
    }"""
modal_txt = re.sub(fetch_assay_old, fetch_assay_new, modal_txt)

# Replace normal button fetch
fetch_normal_old = r"""                    fetch\(`\$\{API_BASE\}/api/scan-trigger`, \{
                      method: 'POST',
                      headers: \{ 'Content-Type': 'application/json' \},
                      body: JSON\.stringify\(\{ token: currentBooking\.tokenNumber, payload: \{\} \}\)
                    \}\)\.catch\(\(\) => \{\}\);"""

fetch_normal_new = """                    if (currentBooking) {
                      let nextStatus: any = 'IN_TRANSIT';
                      let remarks = 'Token verified.';
                      let officer = 'APMC Officer';
                      
                      if (currentBooking.status === 'BOOKED') {
                        nextStatus = 'IN_TRANSIT'; remarks = 'Proceeding to Mandi Gate.'; officer = 'APMC Dispatch Officer';
                      } else if (currentBooking.status === 'IN_TRANSIT') {
                        nextStatus = 'ARRIVED_AT_GATE'; remarks = 'Arrived at Gate 3.'; officer = 'APMC Entry Officer';
                      } else if (currentBooking.status === 'QUALITY_VERIFIED') {
                        nextStatus = 'WEIGHED'; remarks = 'Electronic Weighbridge Complete.'; officer = 'Weighbridge Operator';
                      } else if (currentBooking.status === 'WEIGHED') {
                        nextStatus = 'PAYMENT_COMPLETED'; remarks = 'PFMS DBT Payment Cleared'; officer = 'Treasury Officer';
                      }
                      
                      const randomNum = Math.floor(1000 + Math.random() * 9000);
                      const newToken = `KT-${(currentBooking.state || 'MP').slice(0, 2).toUpperCase()}-2026-${randomNum}`;
                      
                      updateBookingStatus(
                        currentBooking.id, 
                        nextStatus, 
                        remarks, 
                        officer, 
                        false, 
                        { tokenNumber: newToken }
                      );
                    }"""
modal_txt = re.sub(fetch_normal_old, fetch_normal_new, modal_txt)

with open('src/components/PillarGovt/MandiGateOfficerModal.tsx', 'w', encoding='utf-8') as f:
    f.write(modal_txt)

print("Decentralized scan logic directly into MandiGateOfficerModal")
