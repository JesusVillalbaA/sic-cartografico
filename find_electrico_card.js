const fs = require('fs');
const path = require('path');

const mapDir = path.join(__dirname, 'components', 'map');

function findInDir(dir, pattern) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            findInDir(full, pattern);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            const content = fs.readFileSync(full, 'utf8');
            if (content.includes(pattern)) {
                console.log(`Found '${pattern}' in ${full}`);
            }
        }
    }
}

findInDir(mapDir, 'ElectricoCard');
findInDir(path.join(__dirname, 'app'), 'ElectricoCard');
