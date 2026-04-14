import fs from 'fs';
import path from 'path';

const dirs = [
    path.join(process.cwd(), 'pages'),
    path.join(process.cwd(), 'components')
];

function removeGlow(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            removeGlow(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            // Remove the bright glowing shadows from the logo and rank level
            updatedContent = updatedContent.replace(/shadow-emerald-100\/50/g, "shadow-emerald-900/20");
            updatedContent = updatedContent.replace(/shadow-emerald-100/g, "shadow-black/20");

            // Also tone down any glow-emerald classes that might be too bright on #054231
            updatedContent = updatedContent.replace(/glow-emerald/g, "");

            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`Removed glow in: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirs) {
    if (fs.existsSync(dir)) removeGlow(dir);
}
console.log('Glow Removal Done.');
