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

router.get('/pharmaciesPerBarangay', async (req, res) => {
    try {
      const pharmaciesByBarangay = await Pharmacy.aggregate([
        {
          $lookup: {
            from: 'users', // Collection name for the referenced User schema
            localField: 'userInfo',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        {
          $unwind: '$userInfo',
        },
        {
          $group: {
            _id: '$userInfo.barangay',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            barangay: '$_id',
            count: 1,
          },
        },
        {
          $sort: { barangay: 1 },
        },
      ]);
  
      res.status(200).json({
        success: true,
        data: pharmaciesByBarangay,
      });
    } catch (error) {
      console.error('Error fetching pharmacies per barangay:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching data.',
      });
    }
  });
  

module.exports = router;
