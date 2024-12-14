const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

exports.createEvent = async (req, res) => {
    try {
        const { name, type, date, time, location, description, capacity } = req.body;
        
        const event = await Event.create({
            name,
            type,
            date,
            time,
            location,
            description,
            capacity,
            createdBy: req.user._id
        });

        res.status(201).json(event);
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('createdBy', 'username')
            .populate('attendees', 'username email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rsvpEvent = async (req, res) => {
    try {
        const { name, email, phone, requirements } = req.body;
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.attendees.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }
  
        // Check capacity
        if (event.attendees.length >= event.capacity) {
            return res.status(400).json({ message: 'Event is at full capacity' });
        }

        // Create registration record
        const registration = await Registration.create({
            eventId: event._id,
            userId: req.user._id,
            name,
            email,
            phone,
            requirements
        });

        // Add user to attendees
        event.attendees.push(req.user._id);
        await event.save();

        // Add event to user's registered events
        await User.findByIdAndUpdate(req.user._id, {
            $push: { registeredEvents: event._id }
        });

        res.json({ message: 'Successfully registered for event', registration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEventRegistrations = async (req, res) => {
    try {
        const eventId = req.params.id;
        const registrations = await Registration.find({ eventId })
            .populate('userId', 'username email')
            .populate('eventId', 'name date time')
            .sort('-registrationDate');
        
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllEventRegistrations = async (req, res) => {
    try {
        console.log('Fetching all registrations');
        const registrations = await Registration.find()
            .populate('eventId', 'name date time')
            .populate('userId', 'username email')
            .sort('-registrationDate');
        
        console.log('Registrations found:', registrations.length);
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: error.message });
    }
};