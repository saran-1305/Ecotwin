import fs from 'fs';
import path from 'path';

const dirs = [
    path.join(process.cwd(), 'pages'),
    path.join(process.cwd(), 'components')
];

function refineText(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            refineText(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            // Slate replacements to fit the Emerald / #054231 scheme better
            updatedContent = updatedContent.replace(/text-slate-100/g, "text-[#F8F9FA]");
            updatedContent = updatedContent.replace(/text-slate-200/g, "text-emerald-50");
            updatedContent = updatedContent.replace(/text-slate-300/g, "text-emerald-100/90");
            updatedContent = updatedContent.replace(/text-slate-400/g, "text-emerald-200/80");
            updatedContent = updatedContent.replace(/text-slate-500/g, "text-emerald-200/60");

            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`Updated text in: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirs) {
    if (fs.existsSync(dir)) refineText(dir);
}
console.log('Text Polish Done.');
