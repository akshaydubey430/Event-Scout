/**
 * Eventbrite Sydney Scraper
 * Uses Puppeteer for JavaScript-rendered content
 */

const puppeteer = require('puppeteer');

const EVENTBRITE_URL = 'https://www.eventbrite.com.au/d/australia--sydney/events/';

/**
 * Scrape events from Eventbrite Sydney
 * @returns {Array} Array of event objects
 */
async function scrapeEventbrite() {
  console.log('[Eventbrite] Starting scrape...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(EVENTBRITE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for event cards to load
    await page.waitForSelector('[data-testid="event-card"]', { timeout: 10000 }).catch(() => {
      console.log('[Eventbrite] No event cards found with testid, trying alternative selector...');
    });

    // Extract event data
    const events = await page.evaluate(() => {
      const eventCards = document.querySelectorAll('[data-testid="event-card"], .discover-search-desktop-card, .eds-event-card');
      const results = [];

      eventCards.forEach((card, index) => {
        try {
          // Try multiple selector strategies
          const titleEl = card.querySelector('h2, h3, [data-testid="event-card-title"], .eds-event-card__formatted-name--is-clamped');
          const dateEl = card.querySelector('[data-testid="event-card-date"], .eds-event-card-content__sub-title, time');
          const venueEl = card.querySelector('[data-testid="event-card-venue"], .card-text--truncated__one');
          const imageEl = card.querySelector('img');
          const linkEl = card.querySelector('a[href*="eventbrite"]');

          if (!titleEl || !linkEl) return;

          const url = linkEl.href;
          // Extract event ID from URL
          const urlMatch = url.match(/(\d+)(?:\?|$)/);
          const sourceEventId = urlMatch ? urlMatch[1] : `eb-${index}-${Date.now()}`;

          results.push({
            title: titleEl.textContent?.trim() || '',
            dateTimeRaw: dateEl?.textContent?.trim() || '',
            venueName: venueEl?.textContent?.trim() || '',
            imageUrl: imageEl?.src || imageEl?.getAttribute('data-src') || '',
            originalEventUrl: url,
            sourceEventId: sourceEventId
          });
        } catch (e) {
          console.error('Error parsing card:', e);
        }
      });

      return results;
    });

    console.log(`[Eventbrite] Found ${events.length} events`);

    // Process and normalize events
    const normalizedEvents = events.map(event => ({
      title: event.title,
      dateTime: parseEventDate(event.dateTimeRaw),
      venueName: event.venueName,
      venueAddress: '',
      city: 'Sydney',
      description: '',
      categoryTags: ['eventbrite'],
      imageUrl: event.imageUrl,
      sourceName: 'eventbrite',
      sourceEventId: event.sourceEventId,
      originalEventUrl: event.originalEventUrl
    }));

    return normalizedEvents.filter(e => e.title && e.originalEventUrl);

  } catch (error) {
    console.error('[Eventbrite] Scraping error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Parse various date formats from Eventbrite
 * @param {string} dateStr Raw date string
 * @returns {Date} Parsed date
 */
function parseEventDate(dateStr) {
  if (!dateStr) return new Date();
  
  try {
    // Try direct parsing first
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Handle formats like "Sat, Feb 15 • 7:00 PM"
    const patterns = [
      /(\w+),?\s*(\w+)\s+(\d+)\s*[•·]\s*(\d+):(\d+)\s*(AM|PM)/i,
      /(\w+)\s+(\d+),?\s*(\d{4})/i
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        // Construct a parseable date string
        const reconstructed = dateStr.replace(/[•·]/g, '');
        const reparsed = new Date(reconstructed);
        if (!isNaN(reparsed.getTime())) {
          return reparsed;
        }
      }
    }

    // Default to current date if parsing fails
    return new Date();
  } catch (e) {
    return new Date();
  }
}

module.exports = { scrapeEventbrite };
