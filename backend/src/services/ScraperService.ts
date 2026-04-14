
import axios from 'axios';
import * as cheerio from 'cheerio';

export class ScraperService {
    async scrapeProductPage(url: string): Promise<{ title: string; description: string; price?: string; image?: string }> {
        try {
            const { data } = await axios.get(url, {
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
        } catch (error) {
            console.error('Error scraping product page:', error);
            // Return empty/partial data instead of throwing to allow AI to try with just URL/fallback
            return {
                title: '',
                description: '',
                price: undefined,
                image: undefined
            };
        }
    }
}
