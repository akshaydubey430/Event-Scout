/**
 * Utility to detect changes between scraped event data and existing event
 * Returns: { isNew: boolean, isUpdated: boolean, changes: object }
 */

const fieldsToCompare = [
  'title',
  'dateTime',
  'venueName',
  'venueAddress',
  'description',
  'imageUrl'
];

/**
 * Compare scraped event data with existing event from DB
 * @param {Object} scrapedData - Newly scraped event data
 * @param {Object|null} existingEvent - Existing event from DB (null if new)
 * @returns {Object} { isNew, isUpdated, changes }
 */
function diffEvent(scrapedData, existingEvent) {
  // New event - doesn't exist in DB
  if (!existingEvent) {
    return {
      isNew: true,
      isUpdated: false,
      changes: {}
    };
  }

  const changes = {};
  let hasChanges = false;

  for (const field of fieldsToCompare) {
    const scrapedValue = scrapedData[field];
    const existingValue = existingEvent[field];

    // Handle date comparison
    if (field === 'dateTime') {
      const scrapedDate = new Date(scrapedValue).getTime();
      const existingDate = new Date(existingValue).getTime();
      
      if (scrapedDate !== existingDate) {
        changes[field] = {
          old: existingValue,
          new: scrapedValue
        };
        hasChanges = true;
      }
    } else {
      // String comparison (normalize nulls and empty strings)
      const normalizedScraped = (scrapedValue || '').toString().trim();
      const normalizedExisting = (existingValue || '').toString().trim();
      
      if (normalizedScraped !== normalizedExisting) {
        changes[field] = {
          old: existingValue,
          new: scrapedValue
        };
        hasChanges = true;
      }
    }
  }

  return {
    isNew: false,
    isUpdated: hasChanges,
    changes
  };
}

/**
 * Determine the new status based on diff result and current status
 * @param {Object} diffResult - Result from diffEvent
 * @param {string} currentStatus - Current event status
 * @returns {string} New status
 */
function getNewStatus(diffResult, currentStatus) {
  if (diffResult.isNew) {
    return 'new';
  }
  
  if (diffResult.isUpdated) {
    return 'updated';
  }
  
  // If imported, keep imported status
  if (currentStatus === 'imported') {
    return 'imported';
  }
  
  // No changes, keep current status
  return currentStatus;
}

module.exports = {
  diffEvent,
  getNewStatus,
  fieldsToCompare
};
