const { User } = require('../models/user');
const { Pharmacy } = require('../models/pharmacy');
const { Customer } = require('../models/customer');
const { Diseases } = require('../models/disease');
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

const uploadOptions = multer({ storage: storage }).array('permits', 10);


router.post('/register', (req, res) => {
    console.log(req.files);
    console.log( req.body.diseases);
    uploadOptions(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: err });
        } 

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

            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/photos/`;
            const permitPaths = files.map(file => `${basePath}${file.filename}`);

            const newPharmacy = new Pharmacy({
                userInfo: user.id,
                permits: permitPaths,
            });

            try {
                const savedPharmacy = await newPharmacy.save();
                return res.status(201).send(savedPharmacy);
            } catch (error) {
                return res.status(500).json({ success: false, error: error.message });
            }
        }

        return res.send(user);
    });
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
        res.status(400).send('PASSWORD IS WRONG!');
    }
})

module.exports = router;