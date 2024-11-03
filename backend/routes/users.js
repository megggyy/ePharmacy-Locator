const { User } = require('../models/user');
const { Pharmacy } = require('../models/pharmacy');
const { Customer } = require('../models/customer');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/permits/');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage }).array('image', 10); // Update to handle multiple files


router.post('/register', async (req, res) => {
    console.log(req.body)
    try {
        
        if (!req.body.password) {
            return res.status(400).send('Password is required!');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);

        // Hashing the password
        let password = bcrypt.hashSync(req.body.password, salt);

        // Create user object based on request data
        let user = new User({
            email: req.body.email,
            passwordHash: password,
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

        if (user.role === 'Customer') {
            let customer = new Customer({
                userInfo: user.id,
                disease: req.body.disease,
            });

            customer = await customer.save();

            if (!customer) {
                return res.status(400).send('The customer cannot be created!');
            }
        }
        else if (user.role === 'PharmacyOwner') {
            uploadOptions(req, res, async (err) => {
                if (err) {
                    return res.status(500).json({success: false, error: err})
                } else {
                    const files = req.files;
                    if (!files || files.length === 0) {
                        return res.status(400).send('NO PERMITS IN THE REQUEST');
                    }
        
                    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/photos/`;
                    let permitPaths = [];
                    files.forEach(file => {
                        const fileName = file.filename;
                        permitPaths.push(`${basePath}${fileName}`);
                    });
        
                    const newPharmacy = new Pharmacy({
                        userInfo: user.id,
                        permits: permitPaths
                    });
        
                    try {
                        const savedPharmacy = await newPharmacy.save();
                        res.status(201).send(savedPharmacy);
                    } catch (error) {
                        return res.status(500).json({success: false, error: err})
                    }
                }
            });
        }


        res.send(user);
    } catch (error) {
        console.error('Error during registration:', error); // Log error details
        res.status(500).send('An error occurred during the process: ' + error.message);
    }
});


router.post('/login', async (req, res) => {
    console.log(req.body.email)
    const user = await User.findOne({ email: req.body.email })

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
        )
        res.status(200).send({ user: user.email, token: token })
    } else {
        res.status(400).send('password is wrong!');
    }
})

module.exports = router;