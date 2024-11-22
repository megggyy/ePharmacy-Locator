const express = require('express');
const { Medicine } = require('../models/medicine');
const { Pharmacy } = require('../models/pharmacy');
const { User } = require('../models/user');
const { MedicationCategory } = require('../models/medication-category');
const { uploadOptions } = require('../utils/cloudinary');
const router = express.Router();


// medicine per category chart
router.get('/medicinesPerCategory', async (req, res) => {
    try {
        const categories = await MedicationCategory.aggregate([
            {
                $lookup: {
                    from: 'medicines',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'medicines'
                }
            },
            {
                $project: {
                    name: 1,
                    count: { $size: '$medicines' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching medicines per category' });
    }
});
// Create Medicine
router.post('/create', (req, res, next) => {
    req.folder = "medicines"; // Specify folder name for Cloudinary
    next();
}, uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        imagePaths = files.map(file => file.path); // Cloudinary URLs
    }

    const { name, description, stock, pharmacy, category } = req.body;

    const pharmacyExists = await Pharmacy.findById(pharmacy);
    if (!pharmacyExists) return res.status(400).send("Invalid Pharmacy ID");

    const categoryExists = await MedicationCategory.findById(category);
    if (!categoryExists) return res.status(400).send("Invalid Category ID");

    let medicine = new Medicine({
        name,
        description,
        stock,
        pharmacy,
        category,
        images: imagePaths
    });

    try {
        medicine = await medicine.save();
        res.send(medicine);
    } catch (err) {
        res.status(500).send('The medicine cannot be created');
    }
});

// ADMIN
// Create Medicine
router.post('/admin/create', (req, res, next) => {
    req.folder = "medicines"; // Specify folder name for Cloudinary
    next();
}, uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        imagePaths = files.map(file => file.path); // Cloudinary URLs
    }

    const { name, description, category } = req.body;

    const categoryExists = await MedicationCategory.findById(category);
    if (!categoryExists) return res.status(400).send("Invalid Category ID");

    let medicine = new Medicine({
        name,
        description,
        category,
        images: imagePaths
    });

    try {
        medicine = await medicine.save();
        res.send(medicine);
    } catch (err) {
        res.status(500).send('The medicine cannot be created');
    }
});

// GET ALL
router.get('/admin', async (req, res) => {
    const { category } = req.query; // Extract category query parameter

    try {
        // Build the query object dynamically
        const query = category ? { category } : {};

        // Fetch medicines with optional filtering by category
        const medicines = await Medicine.find(query)
            .populate('category'); // Populate medication category

        if (!medicines || medicines.length === 0) {
            return res.status(404).json({ success: false, message: 'No medicines found' });
        }

        res.status(200).json(medicines); // Return filtered medicines with populated pharmacy and category
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get One
router.get('/admin/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id)
        .populate('category'); 

        if (!medicine) return res.status(500).json({ message: 'The medicine with the given ID was not found' });

        res.status(200).send(medicine);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//update
router.put('/admin/update/:id', (req, res, next) => {
    req.folder = "medicines"; // Specify folder name for Cloudinary
    next();
}, uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        imagePaths = files.map(file => file.path); // Cloudinary URLs
    }

    const { name, description, category } = req.body;

    const categoryExists = await MedicationCategory.findById(category);
    if (!categoryExists) return res.status(400).send("Invalid Category ID");

    try {
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                category,
                images: imagePaths.length ? imagePaths : undefined,
            },
            { new: true }
        );

        if (!updatedMedicine) return res.status(500).json({ message: 'The medicine cannot be updated' });

        res.send(updatedMedicine);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// vDelete
router.delete('/admin/delete/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndRemove(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found!' });

        res.status(200).json({ success: true, message: 'The medicine is deleted!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
});

//PHARMACY
// Read Medicines (Get All)
router.get('/', async (req, res) => {
    const { category } = req.query; // Extract category query parameter

    try {
        // Build the query object dynamically
        const query = category ? { category } : {};

        // Fetch medicines with optional filtering by category
        const medicines = await Medicine.find(query)
            .populate({
                path: 'pharmacy', // Populating the pharmacy reference
                select: 'location', // Selecting the fields to return from the Pharmacy collection
                populate: {
                    path: 'userInfo',
                    select: 'name street barangay city', // Populate address fields
                },
            })
            .populate('category'); // Populate medication category

        if (!medicines || medicines.length === 0) {
            return res.status(404).json({ success: false, message: 'No medicines found' });
        }

        res.status(200).json(medicines); // Return filtered medicines with populated pharmacy and category
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});



// Read Medicine by ID
router.get('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id)
        .populate({
            path: 'pharmacy',  // Populating the pharmacy reference
            select: 'location',  // Selecting the fields to return from the Pharmacy collection
            populate: {
                path: 'userInfo',
                select: 'name street barangay city contactNumber',  // Populate address fields
            },
        })
        .populate('category'); 

        if (!medicine) return res.status(500).json({ message: 'The medicine with the given ID was not found' });

        res.status(200).send(medicine);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Medicine
router.put('/update/:id', (req, res, next) => {
    req.folder = "medicines"; // Specify folder name for Cloudinary
    next();
}, uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        imagePaths = files.map(file => file.path); // Cloudinary URLs
    }

    const { name, description, stock, pharmacy, category } = req.body;

    const pharmacyExists = await Pharmacy.findById(pharmacy);
    if (!pharmacyExists) return res.status(400).send("Invalid Pharmacy ID");

    const categoryExists = await MedicationCategory.findById(category);
    if (!categoryExists) return res.status(400).send("Invalid Category ID");

    try {
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                stock,
                pharmacy,
                category,
                images: imagePaths.length ? imagePaths : undefined,
            },
            { new: true }
        );

        if (!updatedMedicine) return res.status(500).json({ message: 'The medicine cannot be updated' });

        res.send(updatedMedicine);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Medicine
router.delete('/delete/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndRemove(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found!' });

        res.status(200).json({ success: true, message: 'The medicine is deleted!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
});


module.exports = router;


