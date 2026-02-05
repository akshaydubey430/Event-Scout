const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { isAuthenticated } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get public events with filters
router.get('/', async (req, res) => {
  try {
    const {
      city = 'Sydney',
      keyword,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const query = {
      city: new RegExp(city, 'i'),
      status: { $ne: 'inactive' }
    };

    // Keyword search
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Date range filter
    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) {
        query.dateTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.dateTime.$lte = new Date(endDate);
      }
    }

    // Status filter (for dashboard use)
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ dateTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Event.countDocuments(query)
    ]);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// @route   GET /api/events/dashboard
// @desc    Get all events for dashboard (protected)
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const {
      city = 'Sydney',
      keyword,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 50
    } = req.query;

    const query = { city: new RegExp(city, 'i') };

    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { venueName: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') }
      ];
    }

    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) query.dateTime.$gte = new Date(startDate);
      if (endDate) query.dateTime.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('importedBy', 'displayName email')
        .sort({ lastScrapedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Event.countDocuments(query)
    ]);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('importedBy', 'displayName email')
      .lean();
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// @route   POST /api/events/:id/import
// @desc    Import event to platform (protected)
router.post('/:id/import', isAuthenticated, async (req, res) => {
  try {
    const { importNotes } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: 'imported',
        importedAt: new Date(),
        importedBy: req.user._id,
        importNotes: importNotes || ''
      },
      { new: true }
    ).populate('importedBy', 'displayName email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event, message: 'Event imported successfully' });
  } catch (err) {
    console.error('Error importing event:', err);
    res.status(500).json({ error: 'Failed to import event' });
  }
});

module.exports = router;
