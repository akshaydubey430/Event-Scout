const mongoose = require('mongoose');

const ticketRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  consent: {
    type: Boolean,
    required: true,
    default: false
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  }
}, {
  timestamps: true
});

// Index for analytics
ticketRequestSchema.index({ eventId: 1 });
ticketRequestSchema.index({ email: 1 });

module.exports = mongoose.model('TicketRequest', ticketRequestSchema);
