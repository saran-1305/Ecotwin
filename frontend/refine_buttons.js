import fs from 'fs';
import path from 'path';

const dirs = [
    path.join(process.cwd(), 'pages'),
    path.join(process.cwd(), 'components')
];

function refineButtons(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            refineButtons(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            // Primary buttons across the app
            updatedContent = updatedContent.replace(/bg-emerald-600 text-\[#F8F9FA\]/g, "bg-emerald-400 text-[#054231]");
            updatedContent = updatedContent.replace(/hover:bg-emerald-700/g, "hover:bg-emerald-300");

            // Login/Register
            if (fullPath.includes('Login.tsx') || fullPath.includes('Register.tsx')) {
                updatedContent = updatedContent.replace(/bg-emerald-500 text-\[#F8F9FA\]/g, "bg-emerald-400 text-[#054231]");
                updatedContent = updatedContent.replace(/hover:shadow-emerald-500\/30/g, "hover:shadow-emerald-400/30");
                updatedContent = updatedContent.replace(/text-emerald-100"/g, "text-[#F8F9FA]/80\"");
            }

            // Analyzer
            updatedContent = updatedContent.replace(/placeholder:text-emerald-50\/30/g, "placeholder:text-emerald-100/60");
            updatedContent = updatedContent.replace(/placeholder:text-emerald-100\/30/g, "placeholder:text-emerald-100/60");
            updatedContent = updatedContent.replace(/shadow-emerald-200/g, "shadow-emerald-400/20");
            updatedContent = updatedContent.replace(/bg-\[#0A5A45\] text-emerald-300 flex items-center justify-center text-2xl font-black group-hover:bg-emerald-600 group-hover:text-\[#F8F9FA\]/g, "bg-[#0A5A45] text-emerald-300 flex items-center justify-center text-2xl font-black group-hover:bg-emerald-400 group-hover:text-[#054231]");
            updatedContent = updatedContent.replace(/hover:bg-emerald-600 hover:text-\[#F8F9FA\]/g, "hover:bg-emerald-400 hover:text-[#054231]");

            // Fix ProfilePopover specific styles seamlessly
            updatedContent = updatedContent.replace(/hover:bg-emerald-600 group-hover:text-\[#F8F9FA\]/g, "hover:bg-emerald-400 group-hover:text-[#054231]");
            updatedContent = updatedContent.replace(/group-hover:bg-emerald-600/g, "group-hover:bg-emerald-400 group-hover:text-[#054231]");

            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`Updated buttons in: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirs) {
    if (fs.existsSync(dir)) refineButtons(dir);
}
console.log('Button Polish Done.');
