const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const eventController = require('../controllers/eventController');

// Apply protect middleware to all routes
router.use(protect);

// Admin routes
router.post('/', admin, eventController.createEvent);
router.get('/admin/registrations', admin, eventController.getAllEventRegistrations);
router.get('/:id/registrations', admin, eventController.getEventRegistrations);

// User routes
router.get('/', eventController.getEvents);
router.post('/:id/rsvp', eventController.rsvpEvent);

module.exports = router;