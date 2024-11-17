const { User } = require('../models/user');
const { Pharmacy } = require('../models/pharmacy');
const { Customer } = require('../models/customer');
const { Diseases } = require('../models/disease');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { uploadOptions } = require('../utils/cloudinary'); // Import Cloudinary upload options

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

// Route to get users
router.get('/', async (req, res) => {
    try {
        // Find users with the 'Customer' role
        const users = await User.find({ role: 'Customer' });

        // Optionally populate disease information if needed
        const usersWithDiseaseInfo = await Promise.all(users.map(async (user) => {
            const customer = await Customer.findOne({ userInfo: user.id }).populate('disease', 'name');
            return { ...user._doc, customerDetails: customer };
        }));

        res.json(usersWithDiseaseInfo); // Send the users with disease information
    } catch (err) {
        res.status(500).send('Error fetching users');
    }
});

// Register route for users, using Cloudinary for file uploads
router.post(
    '/register',
    (req, res, next) => {
        req.folder = 'users'; // Set the folder name for Cloudinary uploads
        next();
    }, uploadOptions.array('permits', 10), async (req, res) => {
    console.log(req.files);
    console.log(req.body.diseases);

    try {
        // Create user object based on request data
        let user = new User({
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            isAdmin: req.body.isAdmin,
            name: req.body.name,
            contactNumber: req.body.contactNumber,
            street: req.body.street,
            barangay: req.body.barangay,
            city: req.body.city,
            role: req.body.role,
        });

        user = await user.save();

        if (!user) {
            return res.status(400).send('The user cannot be created!');
        }

        // If the user role is Customer, create a Customer entry
        if (user.role === 'Customer') {

            let disease = await Diseases.findOne({ name: req.body.diseases });
            if (!disease) {
                disease = new Diseases({
                    name: req.body.diseases, 
                });

                disease = await disease.save();
                if (!disease) {
                    return res.status(400).send('The disease cannot be created!');
                }
            }

            let customer = new Customer({
                userInfo: user.id,
                disease: disease.id,
            });

            customer = await customer.save();

            if (!customer) {
                return res.status(400).send('The customer cannot be created!');
            }
            return res.send(customer);

        } else if (user.role === 'PharmacyOwner') {
            // For PharmacyOwner role, handle file uploads and permits
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).send('No permits in the request');
            }

            const permitPaths = files.map(file => file.path); // Cloudinary URLs

            const newPharmacy = new Pharmacy({
                userInfo: user.id,
                permits: permitPaths,
                location: {
                    latitude: parseFloat(req.body.latitude),
                    longitude: parseFloat(req.body.longitude),
                },
            });

            try {
                const savedPharmacy = await newPharmacy.save();
                return res.status(201).send(savedPharmacy);
            } catch (error) {
                return res.status(500).json({ success: false, error: error.message });
            }
        }

        return res.send(user);

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    console.log(req.body.email);
    const user = await User.findOne({ email: req.body.email });

    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        );
        console.log('Login Successful:', token);
        res.status(200).send({ user: user.email, token: token });
    } else {
        res.status(400).send('PASSWORD IS WRONG!');
    }
});

// Get user details by ID
router.get('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Fetch the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        let userDetails = { ...user._doc }; // Clone the user document

        // Fetch additional details based on the user's role
        if (user.role === 'Customer') {
            const customer = await Customer.findOne({ userInfo: userId }).populate('disease', 'name');
            if (customer) {
                userDetails.customerDetails = customer;
            }
        } else if (user.role === 'PharmacyOwner') {
            const pharmacy = await Pharmacy.findOne({ userInfo: userId });
            if (pharmacy) {
                userDetails.pharmacyDetails = pharmacy;
            }
        }

        res.status(200).json(userDetails);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user');
    }
});

module.exports = router;
