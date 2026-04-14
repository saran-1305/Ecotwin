import fs from 'fs';
import path from 'path';

const dirs = [
    path.join(process.cwd(), 'pages'),
    path.join(process.cwd(), 'components')
];

function fixWhiteHover(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixWhiteHover(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            // Revert hover:bg-white back to hover:bg-[#A7F3D0] (emerald-200) for mint buttons
            updatedContent = updatedContent.replace(/hover:bg-white/g, "hover:bg-[#A7F3D0]");

            // Fix ProfilePopover.tsx gray cancel button
            if (fullPath.includes('ProfilePopover.tsx')) {
                updatedContent = updatedContent.replace(/bg-gray-100 text-gray-500/g, "bg-[#0B5A47] text-[#CFE5DA]");
                updatedContent = updatedContent.replace(/hover:bg-gray-200/g, "hover:bg-[#106B53]");
            }

            // Fix ErrorBoundary.tsx
            if (fullPath.includes('ErrorBoundary.tsx')) {
                updatedContent = updatedContent.replace(/bg-gray-100/g, "bg-[#043628] border border-red-500/20");
                updatedContent = updatedContent.replace(/text-gray-700/g, "text-red-200");
            }

            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`Updated hover in: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirs) {
    if (fs.existsSync(dir)) fixWhiteHover(dir);
}
console.log('Hover Fix Done.');
