import fs from 'fs';
import path from 'path';

const dirs = [
    path.join(process.cwd(), 'pages'),
    path.join(process.cwd(), 'components')
];

const replacements = [
    // 1. Structural / Background Colors

    // Main App Backgrounds (ensuring no rogue #033023 or slate remains)
    { regex: /bg-\[#033023\]/g, replacement: "bg-[#043628]" }, // Deep layered BG
    { regex: /bg-\[#0A5A45\]/g, replacement: "bg-[#0B5A47]" }, // Card surface

    // Form Inputs & Modals
    { regex: /bg-white\/5/g, replacement: "bg-[#106B53]/20" },
    { regex: /bg-white\/10/g, replacement: "bg-[#106B53]/30" },
    { regex: /bg-white\/60/g, replacement: "bg-[#0B5A47]" },
    { regex: /bg-white\/80/g, replacement: "bg-[#0B5A47]" },

    // Emerald replacements that were too bright/dark
    { regex: /bg-emerald-50\/20/g, replacement: "bg-[#0B5A47]/40" },
    { regex: /bg-emerald-50\/50/g, replacement: "bg-[#0B5A47]/60" },
    { regex: /bg-emerald-50/g, replacement: "bg-[#0B5A47]" },

    // 2. Borders & Strokes (Subtle, Premium)
    { regex: /border-emerald-600\/30/g, replacement: "border-emerald-500/20" },
    { regex: /border-white\/10/g, replacement: "border-emerald-500/20" },
    { regex: /border-white\/20/g, replacement: "border-emerald-500/30" },

    // 3. Text & Readability (Ivory & Mint)

    // Ivory (#F8F9FA) for main headings
    { regex: /text-white/g, replacement: "text-[#F8F9FA]" },
    // Mint (#CFE5DA) for body/subheadings
    { regex: /text-emerald-100\/90/g, replacement: "text-[#CFE5DA]" },
    { regex: /text-emerald-50/g, replacement: "text-[#CFE5DA]" },
    { regex: /text-emerald-100/g, replacement: "text-[#CFE5DA]" },
    // Softer Mint-Gray (#9FC7B7) for muted text
    { regex: /text-emerald-200\/80/g, replacement: "text-[#9FC7B7]" },
    { regex: /text-emerald-200\/60/g, replacement: "text-[#9FC7B7]" },
    { regex: /text-emerald-600\/70/g, replacement: "text-[#9FC7B7]" },
    { regex: /text-emerald-600\/60/g, replacement: "text-[#9FC7B7]" },

    // Navbar/Tabs text visibility (Active: White/Mint, Inactive: Muted)
    { regex: /text-emerald-200/g, replacement: "text-[#9FC7B7]" },

    // 4. Buttons (Primary & Secondary)
    { regex: /bg-emerald-400 text-\[#054231\]/g, replacement: "bg-[#CFE5DA] text-[#054231]" }, // Bright mint for CTA
    { regex: /hover:bg-emerald-300/g, replacement: "hover:bg-white" },

    // 5. Placeholders & Inputs
    { regex: /placeholder:text-emerald-100\/60/g, replacement: "placeholder:text-[#9FC7B7]/70" },
    { regex: /focus:border-emerald-400/g, replacement: "focus:border-[#CFE5DA]" },
    { regex: /focus:ring-emerald-400\/20/g, replacement: "focus:ring-[#CFE5DA]/20" }
];

function forceGlobalTheme(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            forceGlobalTheme(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            for (const { regex, replacement } of replacements) {
                updatedContent = updatedContent.replace(regex, replacement);
            }

            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`Updated globally: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirs) {
    if (fs.existsSync(dir)) forceGlobalTheme(dir);
}
console.log('Global Theme Forced.');
