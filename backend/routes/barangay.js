const express = require('express');
const { Barangay } = require('../models/barangay'); // Assuming your model file is named `barangay.js`
const multer = require('multer');
const router = express.Router();

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
        cb(uploadError, 'public/barangay/');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

// CREATE a new Barangay
router.post('/create', uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        const basePath = `${req.protocol}://${req.get('host')}/public/barangay/`;
        imagePaths = files.map(file => `${basePath}${file.filename}`);
    }

    let barangay = new Barangay({
        name: req.body.name,
        description: req.body.description,
        images: imagePaths,
    });

    barangay = await barangay.save();

    if (!barangay) {
        return res.status(400).send('The barangay cannot be created!');
    }

    res.send(barangay);
});

// READ all Barangays
router.get('/', async (req, res) => {
    const barangays = await Barangay.find();

    if (!barangays) {
        return res.status(500).json({ success: false });
    }

    res.send(barangays);
});

// READ a specific Barangay by ID
router.get('/:id', async (req, res) => {
    const barangay = await Barangay.findById(req.params.id);

    if (!barangay) {
        return res.status(404).json({ message: 'The barangay with the given ID was not found.' });
    }

    res.status(200).send(barangay);
});

// UPDATE a Barangay
router.put('/update/:id', uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        const basePath = `${req.protocol}://${req.get('host')}/public/barangay/`;
        imagePaths = files.map(file => `${basePath}${file.filename}`);
    }

    const updatedBarangay = await Barangay.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            images: imagePaths.length ? imagePaths : undefined,
        },
        { new: true }
    );

    if (!updatedBarangay) {
        return res.status(500).json({ message: 'The barangay cannot be updated.' });
    }

    res.send(updatedBarangay);
});

// DELETE a Barangay
router.delete('/delete/:id', async (req, res) => {
    Barangay.findByIdAndRemove(req.params.id)
        .then(barangay => {
            if (barangay) {
                return res.status(200).json({ success: true, message: 'The barangay is deleted!' });
            } else {
                return res.status(404).json({ success: false, message: 'Barangay not found!' });
            }
        })
        .catch(err => {
            return res.status(500).json({ success: false, error: err });
        });
});

module.exports = router;
