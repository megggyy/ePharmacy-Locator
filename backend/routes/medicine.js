const express = require('express');
const { Medicine } = require('../models/medicine');
const { Pharmacy } = require('../models/pharmacy');
const { User } = require('../models/user');
const { MedicationCategory } = require('../models/medication-category');
const { uploadOptions } = require('../utils/cloudinary');
const router = express.Router();

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

// Read Medicines (Get All)
router.get('/', async (req, res) => {
    try {
        const medicines = await Medicine.find()
            .populate({
                path: 'pharmacy',
                populate: {
                    path: 'userInfo',
                    select: 'name'
                }
            })
            .populate('category');

        if (!medicines) {
            return res.status(500).json({ success: false, message: 'No medicines found' });
        }

        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Read Medicine by ID
router.get('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id)
            .populate({
                path: 'pharmacy',
                populate: {
                    path: 'userInfo',
                    select: 'name'
                }
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




// Update Medicine
// router.put('/update/:id', uploadOptions.array('images', 10), async (req, res) => {
//     const files = req.files;
//     let imagePaths = [];

//     if (files) {
//         const basePath = `${req.protocol}://${req.get('host')}/public/medicine/`;
//         imagePaths = files.map(file => `${basePath}${file.filename}`);
//     }

//     const { name, description, stock, pharmacy, category } = req.body;

//     const pharmacyExists = await Pharmacy.findById(pharmacy);
//     if (!pharmacyExists) return res.status(400).send("Invalid Pharmacy ID");

//     const categoryExists = await MedicationCategory.findById(category);
//     if (!categoryExists) return res.status(400).send("Invalid Category ID");

//     // Update the medicine document
//     const updatedMedicine = await Medicine.findByIdAndUpdate(
//         req.params.id,
//         {
//             name,
//             description,
//             stock,
//             pharmacy,
//             category,
//             images: imagePaths.length ? imagePaths : undefined,
//         },
//         { new: true }
//     );

//     if (!updatedMedicine) return res.status(500).json({ message: 'The medicine cannot be updated' });

//     // Fetch the category name after updating the medicine
//     const populatedCategory = await MedicationCategory.findById(updatedMedicine.category);

//     // Return the updated medicine along with the category name
//     res.send({
//         ...updatedMedicine.toObject(),
//         categoryName: populatedCategory.name, // Add the category name to the response
//     });
// });