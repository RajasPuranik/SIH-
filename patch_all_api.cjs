const fs = require('fs');
const path = require('path');

const api_base_logic = `const API_BASE = (window as any).Capacitor && (window as any).Capacitor.isNative ? 'https://kisantrack.vercel.app' : '';`;

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Add API_BASE definition if needed and if it fetches /api
    if (content.includes("fetch('/api") || content.includes('fetch("/api') || content.includes('`/api/tts')) {
        if (!content.includes('const API_BASE =')) {
            // Find a good place to put it
            if (content.includes('export const')) {
                content = content.replace(/(export const [a-zA-Z0-9_]+\s*[:=][^\{]*\{)/, `${api_base_logic}\n\n$1`);
            } else if (content.includes('export default')) {
                content = content.replace(/(export default [a-zA-Z0-9_]+)/, `${api_base_logic}\n\n$1`);
            }
        }
    }

    // Replace fetch paths
    content = content.replace(/fetch\(['"`]\/api\//g, 'fetch(`${API_BASE}/api/');
    content = content.replace(/fetch\(\`\$\{API_BASE\}\/api\//g, 'fetch(`${API_BASE}/api/'); // prevent double
    // fix template literals that got messed up in previous python script
    content = content.replace(/\$\{API_BASE\}\/api\/scan-trigger', \{/g, '${API_BASE}/api/scan-trigger`, {');

    // PhoneBotModal specific
    if (filePath.includes('PhoneBotModal')) {
        content = content.replace(/audioUrl \= \`\/api\/tts/g, 'audioUrl = `${API_BASE}/api/tts');
        content = content.replace(/new Audio\(\`\/api\/tts/g, 'new Audio(`${API_BASE}/api/tts');
    }

    // audioRecorder.ts
    if (filePath.includes('audioRecorder.ts')) {
        content = content.replace(/fetch\(['"`]\/api\/stt/g, 'fetch(`${(window as any).Capacitor && (window as any).Capacitor.isNative ? "https://kisantrack.vercel.app" : ""}/api/stt');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const walkSync = function(dir, filelist) {
    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

const allFiles = walkSync('src');
allFiles.forEach(processFile);
console.log("Done");
