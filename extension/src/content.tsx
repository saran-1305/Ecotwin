import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// Function to extract Amazon product details
const extractAmazonData = () => {
  const title = document.getElementById("productTitle")?.innerText?.trim() ||
    document.querySelector("#title")?.textContent?.trim() || ""
  if (!title) return null

  const brand = document.querySelector("#bylineInfo")?.textContent?.trim().replace(/^Brand:\s*/i, '') || ""
  const priceText = document.querySelector(".a-price .a-offscreen")?.textContent?.trim() || ""

  let imageUrl = ""
  const imgTag = document.querySelector("#landingImage, #imgBlkFront, #main-image") as HTMLImageElement
  if (imgTag) {
    if (imgTag.dataset.oldHires) imageUrl = imgTag.dataset.oldHires
    else if (imgTag.dataset.aDynamicImage) {
      try {
        const data = JSON.parse(imgTag.dataset.aDynamicImage)
        imageUrl = Object.keys(data).pop() || imgTag.src
      } catch (e) { }
    }
    if (!imageUrl) imageUrl = imgTag.src
  }

  const bullets: string[] = []
  document.querySelectorAll("#feature-bullets li span.a-list-item").forEach(el => {
    if (el.textContent) {
      bullets.push(el.textContent.trim())
    }
  })

  let description = document.querySelector("#productDescription")?.textContent?.trim() || ""
  // Fallback description from A+ content
  if (!description) {
    description = document.querySelector("#aplus")?.textContent?.trim() || ""
  }

  const materials: string[] = []
  document.querySelectorAll("#productDetails_techSpec_section_1 tr").forEach(row => {
    const th = row.querySelector("th")?.textContent?.trim()
    const td = row.querySelector("td")?.textContent?.trim()
    if (th && td && (th.toLowerCase().includes("material") || th.toLowerCase().includes("fabric"))) {
      materials.push(td)
    }
  })

  return { title, brand, priceText, imageUrl, bullets, description, materials: materials.length ? materials : null }
}

const getProductData = () => {
  const hostname = window.location.hostname

  if (hostname.includes("amazon")) {
    const data = extractAmazonData()
    if (data) return data
  } else if (hostname.includes("flipkart")) {
    const title = document.querySelector(".B_NuCI")?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() || ""
    if (title) return { title, brand: "", priceText: "", imageUrl: "", bullets: [], description: "", materials: null }
  }

  // Generic fallback for all other sites
  const title = document.querySelector("h1")?.textContent?.trim() || document.title || document.querySelector("meta[property='og:title']")?.getAttribute("content")?.trim() || ""
  if (title) return { title, brand: "", priceText: "", imageUrl: "", bullets: [], description: "", materials: null }

  return null
}

// Main function to run and save data
const scanProduct = () => {
  const data = getProductData()
  if (data && data.title) {
    console.log("EcoImpactAI: Scanned product:", data.title)
    chrome.storage.local.set({
      currentProduct: {
        ...data,
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
