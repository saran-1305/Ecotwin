import fs from 'fs';
import path from 'path';

const dirs = [
    path.join(process.cwd(), 'pages'),
    path.join(process.cwd(), 'components')
];

function fixGradients(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixGradients(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            // Fix the massive white fade in the hero section
            updatedContent = updatedContent.replace(/bg-gradient-to-b from-transparent via-white\/70 to-white/g, "bg-gradient-to-b from-[#054231]/0 via-[#043628]/80 to-[#054231]");

            // Fix the improperly generated regex #0B5A470 back to emerald-500
            updatedContent = updatedContent.replace(/bg-\[#0B5A47\]0/g, "bg-emerald-500");

            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`Updated gradients in: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirs) {
    if (fs.existsSync(dir)) fixGradients(dir);
}
console.log('Gradient Fix Done.');
