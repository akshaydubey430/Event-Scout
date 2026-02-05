const express = require('express');
const router = express.Router();
const TicketRequest = require('../models/TicketRequest');
const Event = require('../models/Event');

// @route   POST /api/ticket-requests
// @desc    Store email consent for ticket request
router.post('/', async (req, res) => {
  try {
    const { email, consent, eventId } = req.body;

    // Validate required fields
    if (!email || consent === undefined || !eventId) {
      return res.status(400).json({
        error: 'Missing required fields: email, consent, eventId'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Create ticket request
    const ticketRequest = await TicketRequest.create({
      email,
      consent,
      eventId
    });

    res.status(201).json({
      success: true,
      message: 'Ticket request recorded',
      redirectUrl: event.originalEventUrl
    });
  } catch (err) {
    console.error('Error creating ticket request:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// @route   GET /api/ticket-requests/stats
// @desc    Get ticket request statistics (for analytics)
router.get('/stats', async (req, res) => {
  try {
    const stats = await TicketRequest.aggregate([
      {
        $group: {
          _id: '$eventId',
          count: { $sum: 1 },
          consentCount: {
            $sum: { $cond: ['$consent', 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          eventTitle: '$event.title',
          count: 1,
          consentCount: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
