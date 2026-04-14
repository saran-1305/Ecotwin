"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class ScraperService {
    scrapeProductPage(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://www.google.com/'
                    },
                    timeout: 10000 // 10s timeout
                });
                const $ = cheerio.load(data);
                // Remove script, style, and other non-content elements
                $('script, style, nav, footer, header').remove();
                // Try to find the title based on common selectors or meta tags
                let title = $('meta[property="og:title"]').attr('content') ||
                    $('h1').first().text().trim() ||
                    $('title').text().trim();
                // Try to find the description
                let description = $('meta[property="og:description"]').attr('content') ||
                    $('meta[name="description"]').attr('content') ||
                    $('#product-description').text().trim() ||
                    $('.product-description').text().trim() ||
                    $('body').text().trim().substring(0, 1000); // Fallback to first 1000 chars of body text
                // Clean up whitespace
                title = title ? title.replace(/\s+/g, ' ').trim() : '';
                description = description ? description.replace(/\s+/g, ' ').trim() : '';
                // Try to find price
                let price = $('meta[property="product:price:amount"]').attr('content') ||
                    $('.price').first().text().trim() ||
                    $('.product-price').first().text().trim();
                // Try to find image
                let image = $('meta[property="og:image"]').attr('content') ||
                    $('#landingImage').attr('src') ||
                    $('#imgBlkFront').attr('src') ||
                    $('.a-dynamic-image').first().attr('src') ||
                    $('img').first().attr('src');
                return { title, description, price, image };
            }
            catch (error) {
                console.error('Error scraping product page:', error);
                // Return empty/partial data instead of throwing to allow AI to try with just URL/fallback
                return {
                    title: '',
                    description: '',
                    price: undefined,
                    image: undefined
                };
            }
        });
    }
}
exports.ScraperService = ScraperService;
