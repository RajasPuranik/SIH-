const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix mismatched quotes: fetch(`${API_BASE}/api/bookings'  -> fetch(`${API_BASE}/api/bookings`
    content = content.replace(/(`\$\{API_BASE\}\/api\/[^'"`\?]*?)['"]/g, '$1`');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed quotes in ${filePath}`);
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
