import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: [
        "https://www.amazon.com/*",
        "https://www.amazon.in/*",
        "https://www.flipkart.com/*",
        "https://www.myntra.com/*",
        "https://www.ebay.com/*",
        "https://www.walmart.com/*"
    ]
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_PRODUCT_DATA") {
        const data = extractProductData();
        sendResponse(data);
    }
});

function extractProductData() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    let title = document.title;
    let price = "";
    let image = "";

    // Platform specific extractors
    if (hostname.includes("amazon")) {
        title = document.querySelector("#productTitle")?.textContent?.trim() || document.title;
        price = document.querySelector(".a-price .a-offscreen")?.textContent || "";
        image = document.querySelector("#landingImage")?.getAttribute("src") || "";
    } else if (hostname.includes("flipkart")) {
        title = document.querySelector(".B_NuCI")?.textContent?.trim() || document.title;
        price = document.querySelector("._30jeq3._16Jk6d")?.textContent || "";
        // Flipkart logic varies
    }

    // Generic Fallbacks
    if (!image) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        image = ogImage ? ogImage.getAttribute("content") : "";
    }

    return {
        url,
        title,
        price,
        image,
        timestamp: new Date().toISOString()
    };
}
