const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

const target =               const chars = 'BCDFGHJKLMNPQRSTVWXYZ0123456789';
              const randomSuffix = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
              const newToken = \\\KT-\\\-2026-\\\\\\;
              
              const updatedHistory = [
                ...b.statusHistory,
                {
                  stage: nextStatus as SlotStatus,
                  timestamp: new Date().toLocaleDateString('en-GB', {
                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                  }),
                  remarks,
                  officerName: officer,
                },
              ];
              
              const updatedBk: SlotBooking = { ...b, status: nextStatus as SlotStatus, tokenNumber: newToken, statusHistory: updatedHistory };;

const replacement =               const updatedHistory = [
                ...b.statusHistory,
                {
                  stage: nextStatus as SlotStatus,
                  timestamp: new Date().toLocaleDateString('en-GB', {
                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                  }),
                  remarks,
                  officerName: officer,
                },
              ];
              
              const updatedBk: SlotBooking = { ...b, status: nextStatus as SlotStatus, statusHistory: updatedHistory };;

if (content.includes(target)) {
    content = content.replace(target, replacement);
} else if (content.includes(target.replace(/\r\n/g, '\n'))) {
    content = content.replace(target.replace(/\r\n/g, '\n'), replacement);
}

const target2 =               addNotification({
                type: 'SYSTEM',
                title: 'QR Scanned successfully',
                message: \\\Your token has been scanned. Status updated to \. New token generated for next stage.\\\
              });;

const replacement2 =               addNotification({
                type: 'SYSTEM',
                title: 'QR Scanned successfully',
                message: \\\Your token has been scanned. Status updated to \.\\\
              });;

if (content.includes(target2)) {
    content = content.replace(target2, replacement2);
} else if (content.includes(target2.replace(/\r\n/g, '\n'))) {
    content = content.replace(target2.replace(/\r\n/g, '\n'), replacement2);
}

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Modified AppContext.tsx');
