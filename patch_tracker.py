import re

with open('src/components/PillarGovt/LiveStatusTracker.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# Add a check for REJECTED after the stages definition
patch = """  const isRejected = currentBooking.status === 'REJECTED';
  const getStageIndex = (status: SlotStatus) => {
    if (status === 'REJECTED') return 2; // Failed at Mandi Gate
    return stages.findIndex(s => s.key === status);
  };"""

txt = txt.replace(
    """  const getStageIndex = (status: SlotStatus) => {
    return stages.findIndex(s => s.key === status);
  };""",
    patch
)

# Render a huge REJECTED banner if isRejected is true, right after the Header Summary
banner = """        {isRejected && (
          <div className="mt-6 mb-2 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 text-base">Consignment Rejected: Token Expired</h3>
              <p className="text-sm text-red-700 mt-1">
                Your crop did not meet the required Fair Average Quality (FAQ) standards during the Moisture & Quality Assay at the APMC Mandi gate. 
              </p>
              <div className="mt-3 text-xs bg-white/50 inline-block px-3 py-1.5 rounded-lg border border-red-100 font-medium text-red-900">
                {currentBooking.statusHistory[currentBooking.statusHistory.length - 1]?.remarks || 'Quality standards failed.'}
              </div>
            </div>
          </div>
        )}"""

txt = txt.replace(
    "        {/* Visual Sequential Progress Bar */}",
    banner + "\n\n        {/* Visual Sequential Progress Bar */}"
)

# To prevent progress bar from going past index 2 if rejected, change how we calculate width
txt = txt.replace(
    "style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}",
    "style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%`, backgroundColor: isRejected ? '#ef4444' : '' }}"
)

txt = txt.replace(
    "const isPassed = idx < currentIndex;",
    "const isPassed = idx < currentIndex;\n                if (isRejected && idx >= 2) return null; // hide future steps if rejected"
)

# And fix the icon color logic for the current step if rejected
icon_class_old = r"""className=\{`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 shadow-xs \$\{
                        isPassed
                          \? 'bg-emerald-500 text-white'
                          : isCurrent
                          \? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500 shadow-md'
                          : 'bg-slate-100 text-slate-400'
                      \}`\}"""

icon_class_new = r"""className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 shadow-xs ${
                        isPassed
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? (isRejected ? 'bg-red-100 text-red-700 border-2 border-red-500 shadow-md' : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500 shadow-md')
                          : 'bg-slate-100 text-slate-400'
                      }`}"""

txt = re.sub(icon_class_old, icon_class_new, txt)

# Also import AlertTriangle if not imported
if 'AlertTriangle' not in txt:
    txt = txt.replace('import { Search,', 'import { Search, AlertTriangle,')

with open('src/components/PillarGovt/LiveStatusTracker.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Patched LiveStatusTracker for REJECTED state")
