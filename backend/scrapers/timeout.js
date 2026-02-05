/**
 * TimeOut Sydney Scraper
 * Uses Cheerio for static HTML parsing (faster than Puppeteer)
 */

const axios = require('axios');
const cheerio = require('cheerio');

const TIMEOUT_URL = 'https://www.timeout.com/sydney/things-to-do/things-to-do-in-sydney-this-week';

/**
 * Scrape events from TimeOut Sydney
 * @returns {Array} Array of event objects
 */
async function scrapeTimeOut() {
  console.log('[TimeOut] Starting scrape...');
  
  try {
    const response = await axios.get(TIMEOUT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const events = [];

    // Try multiple selectors for TimeOut's structure
    const selectors = [
      'article[class*="card"]',
      '[class*="tile_tile"]',
      '.feature-item',
      '[data-testid*="tile"]',
      '.articleContent'
    ];

    let foundCards = false;

    for (const selector of selectors) {
      const cards = $(selector);
      if (cards.length > 0) {
        console.log(`[TimeOut] Found ${cards.length} cards with selector: ${selector}`);
        foundCards = true;
        
        cards.each((index, element) => {
          try {
            const $card = $(element);
            
            // Extract data with fallbacks
            const titleEl = $card.find('h2, h3, [class*="title"], [class*="heading"]').first();
            const linkEl = $card.find('a[href*="timeout.com"]').first();
            const imageEl = $card.find('img').first();
            const descEl = $card.find('p, [class*="description"], [class*="summary"]').first();
            const categoryEl = $card.find('[class*="category"], [class*="tag"]').first();

            const title = titleEl.text()?.trim();
            let url = linkEl.attr('href');
            
            if (!title) return;
            
            // Make URL absolute
            if (url && !url.startsWith('http')) {
              url = `https://www.timeout.com${url}`;
            }

            // Generate unique ID from URL or title
            const urlMatch = url?.match(/\/([^\/]+)\/?$/);
            const sourceEventId = urlMatch ? urlMatch[1] : `to-${title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)}-${index}`;

            events.push({
              title,
              dateTimeRaw: '', // TimeOut often doesn't show specific dates in listings
              venueName: '',
              venueAddress: '',
              imageUrl: imageEl.attr('src') || imageEl.attr('data-src') || '',
              originalEventUrl: url || `https://www.timeout.com/sydney/things-to-do`,
              description: descEl.text()?.trim().slice(0, 500) || '',
              category: categoryEl.text()?.trim() || 'Things to Do',
              sourceEventId
            });
          } catch (e) {
            console.error('[TimeOut] Error parsing card:', e.message);
          }
        });
        
        break; // Found cards, stop trying selectors
      }
    }

    if (!foundCards) {
      console.log('[TimeOut] No cards found with any selector, trying generic link extraction...');
      
      // Fallback: extract links with Sydney event content
      $('a[href*="/sydney/"]').each((index, element) => {
        const $link = $(element);
        const title = $link.text()?.trim();
        const url = $link.attr('href');
        
        if (title && title.length > 10 && title.length < 200 && url) {
          const fullUrl = url.startsWith('http') ? url : `https://www.timeout.com${url}`;
          const sourceEventId = `to-fallback-${index}-${Date.now()}`;
          
          events.push({
            title,
            dateTimeRaw: '',
            venueName: '',
            venueAddress: '',
            imageUrl: '',
            originalEventUrl: fullUrl,
            description: '',
            category: 'Things to Do',
            sourceEventId
          });
        }
      });
    }

    console.log(`[TimeOut] Found ${events.length} events`);

    // Normalize and deduplicate
    const seen = new Set();
    const normalizedEvents = events
      .filter(event => {
        if (seen.has(event.sourceEventId)) return false;
        seen.add(event.sourceEventId);
        return event.title && event.originalEventUrl;
      })
      .map(event => ({
        title: event.title,
        dateTime: new Date(), // TimeOut listings often don't have specific dates
        venueName: event.venueName,
        venueAddress: event.venueAddress,
        city: 'Sydney',
        description: event.description,
        categoryTags: [event.category || 'timeout', 'things-to-do'],
        imageUrl: event.imageUrl,
        sourceName: 'timeout',
        sourceEventId: event.sourceEventId,
        originalEventUrl: event.originalEventUrl
      }));

    return normalizedEvents;

  } catch (error) {
    console.error('[TimeOut] Scraping error:', error.message);
    return [];
  }
}

module.exports = { scrapeTimeOut };
