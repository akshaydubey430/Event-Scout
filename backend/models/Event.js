const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  venueName: {
    type: String,
    trim: true
  },
  venueAddress: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    default: 'Sydney',
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  categoryTags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  sourceName: {
    type: String,
    required: true,
    enum: ['eventbrite', 'timeout', 'meetup']
  },
  sourceEventId: {
    type: String,
    required: true
  },
  originalEventUrl: {
    type: String,
    required: true
  },
  lastScrapedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'updated', 'inactive', 'imported'],
    default: 'new'
  },
  importedAt: {
    type: Date
  },
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  importNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for deduplication
eventSchema.index({ sourceName: 1, sourceEventId: 1 }, { unique: true });

// Text index for search
eventSchema.index({ title: 'text', description: 'text', venueName: 'text' });

module.exports = mongoose.model('Event', eventSchema);
