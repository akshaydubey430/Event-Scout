/**
 * Cron Jobs for scheduled scraping
 */

const cron = require('node-cron');
const { runAllScrapers } = require('../scrapers');

let scheduledJob = null;

/**
 * Initialize cron jobs
 * @param {string} schedule - Cron schedule expression (default: every 6 hours)
 */
function initCronJobs(schedule = process.env.CRON_SCHEDULE || '0 */6 * * *') {
  // Validate cron expression
  if (!cron.validate(schedule)) {
    console.error(`Invalid cron schedule: ${schedule}. Using default.`);
    schedule = '0 */6 * * *';
  }

  console.log(`Initializing cron job with schedule: ${schedule}`);

  scheduledJob = cron.schedule(schedule, async () => {
    console.log('\n[CRON] Starting scheduled scrape...');
    const startTime = Date.now();
    
    try {
      const stats = await runAllScrapers(false);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[CRON] Scrape completed in ${duration}s`);
      console.log(`[CRON] Stats: ${stats.total.new} new, ${stats.total.updated} updated`);
    } catch (error) {
      console.error('[CRON] Scrape failed:', error);
    }
  });

  console.log('Cron job scheduled successfully');
  
  // Log next scheduled run
  logNextRun(schedule);
}

/**
 * Log the next scheduled run time
 */
function logNextRun(schedule) {
  const parts = schedule.split(' ');
  let description = '';
  
  if (schedule === '0 */6 * * *') {
    description = 'every 6 hours';
  } else if (schedule.includes('*/')) {
    description = `custom schedule: ${schedule}`;
  } else {
    description = schedule;
  }
  
  console.log(`Next scrape: ${description}`);
}

/**
 * Stop the scheduled job
 */
function stopCronJobs() {
  if (scheduledJob) {
    scheduledJob.stop();
    console.log('Cron job stopped');
  }
}

/**
 * Trigger an immediate scrape (manual trigger)
 */
async function triggerImmediateScrape() {
  console.log('[MANUAL] Triggering immediate scrape...');
  return await runAllScrapers(false);
}

module.exports = {
  initCronJobs,
  stopCronJobs,
  triggerImmediateScrape
};
