# EcoTwin Browser Extension

A React-based Chrome/Edge extension built with Plasmo, Tailwind CSS, and Shadcn UI.

## 🚀 Getting Started

### 1. Install Dependencies
Make sure you are in the `extension` directory:
```bash
cd extension
npm install
```

### 2. Build the Extension
To create a production build:
```bash
npm run build
```
This will generate a `build/chrome-mv3-prod` folder (or similar based on Plasmo version).

### 3. Load into Browser
1. Open Chrome or Edge.
2. Navigate to `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode** (toggle in top right).
4. Click **Load unpacked**.
5. Select the `build/chrome-mv3-prod` folder from this project.

## 🧪 How to Test

### on Amazon / Flipkart
1. Go to any product page (e.g., search for "steel water bottle" on Amazon).
2. Click the **EcoTwin leaf icon** in your browser toolbar.
3. The popup should appear and:
   - Show the "Sustainability Score" gauge.
   - Display a mock score based on keywords in the title/url.
   - Keywords like "steel", "organic", "bottle" TRIGGER HIGH SCORES.
   - Keywords like "plastic", "toy", "polyester" TRIGGER LOW SCORES.
4. Click **Deep Analysis** to open the web app analysis page for that product.

### Troubleshooting
- If "No Product Detected" shows up, try refreshing the page and opening the popup again.
- Ensure the URL matches a product pattern (e.g. `/dp/` for Amazon).

## 🛠 Tech Stack
- **Framework**: [Plasmo](https://docs.plasmo.com/)
- **UI**: React 18, Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
