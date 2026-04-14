import fs from 'fs';
import path from 'path';

const dirs = [
    path.join(process.cwd(), 'pages'),
    path.join(process.cwd(), 'components')
];

const replacements = [
    // Backgrounds - main app bg is #054231, cards are #033023
    { regex: /bg-white/g, replacement: "bg-[#033023]" },
    { regex: /bg-slate-50/g, replacement: "bg-[#054231]" },
    { regex: /bg-emerald-50\/50/g, replacement: "bg-[#033023]/80" },
    { regex: /bg-emerald-50\/20/g, replacement: "bg-[#033023]/50" },
    { regex: /bg-emerald-50/g, replacement: "bg-[#033023]" },

    // Text colors (Dark -> Light)
    { regex: /text-emerald-950/g, replacement: "text-white" },
    { regex: /text-emerald-900/g, replacement: "text-emerald-50" },
    { regex: /text-emerald-800/g, replacement: "text-emerald-100" },
    { regex: /text-emerald-700/g, replacement: "text-emerald-200" },
    { regex: /text-slate-900/g, replacement: "text-slate-100" },
    { regex: /text-slate-800/g, replacement: "text-slate-200" },
    { regex: /text-slate-700/g, replacement: "text-slate-300" },
    { regex: /text-slate-600/g, replacement: "text-slate-400" },
    { regex: /text-slate-400/g, replacement: "text-slate-200" },

    // Borders
    { regex: /border-emerald-100/g, replacement: "border-white/10" },
    { regex: /border-emerald-200/g, replacement: "border-white/20" },
    { regex: /border-emerald-900\/10/g, replacement: "border-white/10" },
    { regex: /border-slate-100/g, replacement: "border-white/10" },
    { regex: /border-slate-200/g, replacement: "border-white/20" }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            // Do not override Auth pages again since we just hand-tuned them
            if (fullPath.includes('Register.tsx') || fullPath.includes('Login.tsx')) {
                continue;
            }

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
console.log('Done.');
