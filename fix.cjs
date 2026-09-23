const fs = require('fs');
let content = fs.readFileSync('src/components/PillarGovt/TokenPassCard.tsx', 'utf-8');

const target = [
'                <span className="text-[11px] text-slate-600 font-mono font-bold block">',
'                  {booking.vehicleNumber}',
'                </span>',
'              </div>'
].join('\r\n');

const target2 = target.replace(/\r\n/g, '\n');

const replacement = [
'                <span className="text-[11px] text-slate-600 font-mono font-bold block">',
'                  {booking.vehicleNumber}',
'                </span>',
'              </div>',
'              ',
'              <div>',
'                <span className="text-slate-400 block text-[11px] flex items-center gap-1 mb-0.5">',
'                  <ShieldCheck className="w-3 h-3 text-slate-400" /> Token Progression',
'                </span>',
'                <ul className="space-y-0.5 mt-1">',
'                  {booking.statusHistory?.map((h, i) => (',
'                    <li key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium leading-tight">',
'                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />',
'                      <span className="truncate">{h.stage.replace(/_/g, \" \")}</span>',
'                    </li>',
'                  ))}',
'                </ul>',
'              </div>'
].join('\n');

if (content.includes(target)) {
    fs.writeFileSync('src/components/PillarGovt/TokenPassCard.tsx', content.replace(target, replacement));
    console.log('Success CRLF');
} else if (content.includes(target2)) {
    fs.writeFileSync('src/components/PillarGovt/TokenPassCard.tsx', content.replace(target2, replacement));
    console.log('Success LF');
} else {
    console.log('Not found');
}
