const express = require('express');
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
        cb(uploadError, 'public/medications/');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });


router.post('/create', uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        const basePath = `${req.protocol}://${req.get('host')}/public/medications/`;
        imagePaths = files.map(file => `${basePath}${file.filename}`);
    }

    let medicationCategory = new MedicationCategory({
        name: req.body.name,
        description: req.body.description,
        images: imagePaths,
    });

    medicationCategory = await medicationCategory.save();

    if (!medicationCategory) {
        return res.status(400).send('The medication category cannot be created!');
    }

    res.send(medicationCategory);
});


router.get('/', async (req, res) => {
    const medicationCategories = await MedicationCategory.find();

    if (!medicationCategories) {
        return res.status(500).json({ success: false });
    }

    res.send(medicationCategories);
});

router.get('/:id', async (req, res) => {
    const medicationCategory = await MedicationCategory.findById(req.params.id);

    if (!medicationCategory) {
        return res.status(500).json({ message: 'The medication category with the given ID was not found.' });
    }

    res.status(200).send(medicationCategory);
});


router.put('/update/:id', uploadOptions.array('images', 10), async (req, res) => {
    const files = req.files;
    let imagePaths = [];

    if (files) {
        const basePath = `${req.protocol}://${req.get('host')}/public/medications/`;
        imagePaths = files.map(file => `${basePath}${file.filename}`);
    }

    const updatedCategory = await MedicationCategory.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            images: imagePaths.length ? imagePaths : undefined,
        },
        { new: true }
    );

    if (!updatedCategory) {
        return res.status(500).json({ message: 'The medication category cannot be updated.' });
    }

    res.send(updatedCategory);
});


router.delete('/delete/:id', async (req, res) => {
    MedicationCategory.findByIdAndRemove(req.params.id)
        .then((medicationCategory) => {
            if (medicationCategory) {
                return res.status(200).json({ success: true, message: 'The medication category is deleted!' });
            } else {
                return res.status(404).json({ success: false, message: 'Medication category not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

module.exports = router;
