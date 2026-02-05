/**
 * Main Scraper Aggregator
 * Runs all scrapers and updates database with proper status logic
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
const { scrapeEventbrite } = require('./eventbrite');
const { scrapeTimeOut } = require('./timeout');
const { diffEvent, getNewStatus } = require('../utils/diffEvent');

/**
 * Run all scrapers and update database
 * @param {boolean} dryRun - If true, don't write to DB
 */
async function runAllScrapers(dryRun = false) {
  console.log('='.repeat(50));
  console.log(`Starting scrape at ${new Date().toISOString()}`);
  console.log(`Dry run: ${dryRun}`);
  console.log('='.repeat(50));

  const stats = {
    eventbrite: { scraped: 0, new: 0, updated: 0, unchanged: 0, errors: 0 },
    timeout: { scraped: 0, new: 0, updated: 0, unchanged: 0, errors: 0 },
    total: { scraped: 0, new: 0, updated: 0, unchanged: 0, errors: 0 }
  };

  try {
    // Run scrapers in parallel
    const [eventbriteEvents, timeoutEvents] = await Promise.all([
      scrapeEventbrite().catch(err => {
        console.error('[Eventbrite] Failed:', err.message);
        return [];
      }),
      scrapeTimeOut().catch(err => {
        console.error('[TimeOut] Failed:', err.message);
        return [];
      })
    ]);

    stats.eventbrite.scraped = eventbriteEvents.length;
    stats.timeout.scraped = timeoutEvents.length;

    const allEvents = [...eventbriteEvents, ...timeoutEvents];
    stats.total.scraped = allEvents.length;

    console.log(`\nTotal events scraped: ${allEvents.length}`);

    if (dryRun) {
      console.log('\n[DRY RUN] Sample events:');
      allEvents.slice(0, 5).forEach((event, i) => {
        console.log(`  ${i + 1}. ${event.title} (${event.sourceName})`);
      });
      return stats;
    }

    // Process each event
    for (const scrapedEvent of allEvents) {
      try {
        // Find existing event by source
        const existing = await Event.findOne({
          sourceName: scrapedEvent.sourceName,
          sourceEventId: scrapedEvent.sourceEventId
        });

        const diff = diffEvent(scrapedEvent, existing);
        const newStatus = getNewStatus(diff, existing?.status);

        if (diff.isNew) {
          // Create new event
          await Event.create({
            ...scrapedEvent,
            status: 'new',
            lastScrapedAt: new Date()
          });
          
          stats[scrapedEvent.sourceName].new++;
          stats.total.new++;
          
        } else if (diff.isUpdated) {
          // Update existing event
          await Event.updateOne(
            { _id: existing._id },
            {
              ...scrapedEvent,
              status: newStatus,
              lastScrapedAt: new Date()
            }
          );
          
          stats[scrapedEvent.sourceName].updated++;
          stats.total.updated++;
          
        } else {
          // No changes, just update lastScrapedAt
          await Event.updateOne(
            { _id: existing._id },
            { lastScrapedAt: new Date() }
          );
          
          stats[scrapedEvent.sourceName].unchanged++;
          stats.total.unchanged++;
        }
        
      } catch (err) {
        console.error(`Error processing event "${scrapedEvent.title}":`, err.message);
        stats[scrapedEvent.sourceName].errors++;
        stats.total.errors++;
      }
    }

    // Mark old events as inactive
    const inactiveThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    const inactiveResult = await Event.updateMany(
      {
        lastScrapedAt: { $lt: inactiveThreshold },
        status: { $nin: ['inactive', 'imported'] }
      },
      { status: 'inactive' }
    );

    console.log(`\nMarked ${inactiveResult.modifiedCount} events as inactive`);

  } catch (error) {
    console.error('Fatal scraping error:', error);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('SCRAPING SUMMARY');
  console.log('='.repeat(50));
  console.log(`Eventbrite: ${stats.eventbrite.scraped} scraped, ${stats.eventbrite.new} new, ${stats.eventbrite.updated} updated`);
  console.log(`TimeOut: ${stats.timeout.scraped} scraped, ${stats.timeout.new} new, ${stats.timeout.updated} updated`);
  console.log(`Total: ${stats.total.scraped} scraped, ${stats.total.new} new, ${stats.total.updated} updated, ${stats.total.errors} errors`);
  console.log('='.repeat(50));

  return stats;
}

// Run directly if called as script
if (require.main === module) {
  require('dotenv').config();
  
  const dryRun = process.argv.includes('--dry-run');
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return runAllScrapers(dryRun);
    })
    .then(() => {
      console.log('\nScraping complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = { runAllScrapers };
