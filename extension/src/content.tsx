import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.amazon.in/*", "https://www.flipkart.com/*", "https://www.amazon.com/*"]
}

// Function to extract product title based on site
const getProductTitle = () => {
  const hostname = window.location.hostname
  let title = ""

  if (hostname.includes("amazon")) {
    title = document.getElementById("productTitle")?.innerText?.trim() ||
      document.querySelector("#title")?.textContent?.trim() || ""
  } else if (hostname.includes("flipkart")) {
    title = document.querySelector(".B_NuCI")?.textContent?.trim() || // Common class for title
      document.querySelector("h1")?.textContent?.trim() || ""
  }

  return title
}

// Main function to run and save data
const scanProduct = () => {
  const title = getProductTitle()
  if (title) {
    console.log("EcoImpactAI: Scanned product:", title)
    chrome.storage.local.set({
      currentProduct: {
        title: title,
        url: window.location.href,
        timestamp: Date.now()
      }
    })
  }
}

// Run on load
window.addEventListener("load", () => {
  scanProduct()
  // Also run efficiently on DOM changes since SPAs update title dynamically
  const observer = new MutationObserver(() => {
    scanProduct()
  })
  const titleElement = document.querySelector("title")
  if (titleElement) {
    observer.observe(titleElement, { childList: true })
  }
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scan") {
    scanProduct()
    sendResponse({ status: "scanned" })
  }
})
