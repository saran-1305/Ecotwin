import fs from 'fs';
import path from 'path';

const dirs = [
    path.join(process.cwd(), 'pages'),
    path.join(process.cwd(), 'components')
];

const replacements = [
    // Backgrounds - Surfaces & Cards
    { regex: /bg-\[#033023\]/g, replacement: "bg-[#0A5A45]" }, // Make cards slightly lighter
    { regex: /bg-emerald-950/g, replacement: "bg-[#054231]" }, // Main Background alignment

    // Text colors (Dark -> Light readability adjustments)
    { regex: /text-white/g, replacement: "text-[#F8F9FA]" }, // Soft ivory off-white
    { regex: /text-emerald-100\/60/g, replacement: "text-emerald-100/90" }, // Better readability for muted text
    { regex: /text-emerald-100\/50/g, replacement: "text-emerald-200/80" }, // Better readability
    { regex: /text-emerald-800\/60/g, replacement: "text-emerald-100/80" },
    { regex: /text-emerald-800\/50/g, replacement: "text-emerald-200/80" },
    { regex: /text-emerald-800\/70/g, replacement: "text-emerald-100/90" },

    // Borders - Green tinted lines instead of pale greys/whites
    { regex: /border-white\/10/g, replacement: "border-emerald-600/30" },
    { regex: /border-white\/20/g, replacement: "border-emerald-500/40" },
    { regex: /border-white\/30/g, replacement: "border-emerald-400/50" },
    { regex: /border-emerald-100\/50/g, replacement: "border-emerald-600/30" }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            for (const { regex, replacement } of replacements) {
                updatedContent = updatedContent.replace(regex, replacement);
            }

            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirs) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}
console.log('Refinement Script Done.');
