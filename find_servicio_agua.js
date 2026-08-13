const fs = require('fs');
const path = require('path');

function searchIn(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            searchIn(full);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            const content = fs.readFileSync(full, 'utf8');
            if (content.includes('servicioAgua')) {
                console.log(`Found 'servicioAgua' in ${full}`);
            }
        }
    }
}
searchIn(path.join(__dirname, 'app'));
searchIn(path.join(__dirname, 'components'));
