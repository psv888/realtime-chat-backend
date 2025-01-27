const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password, contacts: [] });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Username already exists' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.status(200).json({ message: 'Login successful', user });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// Search for a user
router.get('/search/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (user) {
        res.status(200).json({ message: 'User found', username: user.username });
    } else {
        res.status(404).json({ message: 'No user found' });
    }
});

// Remove a contact from the user's list
router.post('/remove-contact', async (req, res) => {
    const { username, contact } = req.body;
    try {
        const user = await User.findOne({ username });
        user.contacts = user.contacts.filter((c) => c !== contact);
        await user.save();
        res.status(200).json({ message: 'Contact removed successfully', contacts: user.contacts });
    } catch (error) {
        res.status(400).json({ message: 'Error removing contact' });
    }
});

// Fetch the contact list of a user
router.get('/:username/contacts', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (user) {
            res.status(200).json({ contacts: user.contacts });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts' });
    }
});



// Add a contact to the user's list
router.post('/add-contact', async (req, res) => {
    const { username, contact } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user.contacts.includes(contact)) {
            user.contacts.push(contact);
            await user.save();
        }
        res.status(200).json({ message: 'Contact added successfully', contacts: user.contacts });
    } catch (error) {
        res.status(400).json({ message: 'Error adding contact' });
    }
});

module.exports = router;
