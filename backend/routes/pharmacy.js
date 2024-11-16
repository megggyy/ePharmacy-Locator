const express = require('express');
const { Pharmacy } = require('../models/pharmacy');
const router = express.Router();

// GET all pharmacies with userInfo populated
router.get('/', async (req, res) => {
    try {
        const pharmacies = await Pharmacy.find()
            .populate({
                path: 'userInfo',  // Populate userInfo field
                select: 'name contactNumber street barangay city'     // Select only the 'name' field from the User schema
            });

        if (!pharmacies) {
            return res.status(500).json({ success: false, message: 'No pharmacies found' });
        }

        res.status(200).json(pharmacies);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
