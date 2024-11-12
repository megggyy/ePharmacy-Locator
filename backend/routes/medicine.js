const express = require('express');
const { Medicine } = require('../models/medicine');
const { Pharmacy } = require('../models/pharmacy');
const { User } = require('../models/user');
const { MedicationCategory } = require('../models/medication-category');
const router = express.Router();
const multer = require('multer');

// Configure image upload
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/medicine/');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

// Create Medicine
router.post('/create', uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        const basePath = `${req.protocol}://${req.get('host')}/public/medicine/`;
        imagePaths = files.map(file => `${basePath}${file.filename}`);
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

    medicine = await medicine.save();

    if (!medicine) return res.status(500).send('The medicine cannot be created');

    res.send(medicine);
});

// Read Medicines (Get All)
// router.get('/', async (req, res) => {
//     const medicines = await Medicine.find().populate('pharmacy').populate('category');

//     if (!medicines) return res.status(500).json({ success: false });

//     res.send(medicines);
// });
router.get('/', async (req, res) => {
    try {
        // Fetch all medicines and populate pharmacy and category details
        const medicines = await Medicine.find()
            .populate({
                path: 'pharmacy',
                populate: {
                    path: 'userInfo',
                    select: 'name' // Only select the name field from the User schema
                }
            })
            .populate('category'); // Populate category details if needed

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
    const medicine = await Medicine.findById(req.params.id)
    .populate({
        path: 'pharmacy',
        populate: {
            path: 'userInfo',
            select: 'name' // Only select the name field from the User schema
        }
    })
    .populate('category'); // Populate category details if needed
    if (!medicine) return res.status(500).json({ message: 'The medicine with the given ID was not found' });

    res.status(200).send(medicine);
});

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

router.put('/update/:id', uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        const basePath = `${req.protocol}://${req.get('host')}/public/medicine/`;
        imagePaths = files.map(file => `${basePath}${file.filename}`);
    }

    const { name, description, stock, pharmacy, category } = req.body;

    const pharmacyExists = await Pharmacy.findById(pharmacy);
    if (!pharmacyExists) return res.status(400).send("Invalid Pharmacy ID");

    const categoryExists = await MedicationCategory.findById(category);
    if (!categoryExists) return res.status(400).send("Invalid Category ID");

    // Update the medicine document
    const updatedMedicine = await Medicine.findByIdAndUpdate(
        req.params.id,
        {
            name,  // Update name
            description,
            stock,
            pharmacy,
            category,
            images: imagePaths.length ? imagePaths : undefined,
        },
        { new: true }
    );

    if (!updatedMedicine) return res.status(500).json({ message: 'The medicine cannot be updated' });

    // Fetch the category name after updating the medicine
    const populatedCategory = await MedicationCategory.findById(updatedMedicine.category);

    // Return the updated medicine along with the category name
    res.send({
        ...updatedMedicine.toObject(),
        categoryName: populatedCategory.name, // Add the category name to the response
    });
});


// Delete Medicine
router.delete('/delete/:id', async (req, res) => {
    Medicine.findByIdAndRemove(req.params.id)
        .then(medicine => {
            if (medicine) {
                return res.status(200).json({ success: true, message: 'The medicine is deleted!' });
            } else {
                return res.status(404).json({ success: false, message: 'Medicine not found!' });
            }
        })
        .catch(err => {
            return res.status(500).json({ success: false, error: err });
        });
});

module.exports = router;
