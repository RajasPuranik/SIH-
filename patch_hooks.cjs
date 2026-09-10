const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/LiveStatusTracker.tsx', 'utf8');

const regex = /if \(\!currentBooking\) \{[\s\S]*?\}\n\n  const \[searchQuery, setSearchQuery\] = useState\(currentBooking\?\.tokenNumber \|\| ''\);/;

const replacement = `const [searchQuery, setSearchQuery] = useState(currentBooking?.tokenNumber || '');

  if (!currentBooking) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <QrCode className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">No Active Tokens</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            You don't have any active Mandi gate passes. Book a slot from the "Book Mandi Slot" tab to generate your priority token.
          </p>
        </div>
      </div>
    );
  }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/PillarGovt/LiveStatusTracker.tsx', content);
