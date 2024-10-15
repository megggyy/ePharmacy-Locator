const { User } = require('../models/user');
const { Pharmacy } = require('../models/pharmacy');
const { Customer } = require('../models/pharmacy');
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
        cb(uploadError, 'public/uploads/permits/');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.post('/', async (req, res) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);

    try {
        // Hashing the password
        let password = bcrypt.hashSync(req.body.password, salt);

        // Create user object based on request data
        let user = new User({
            email: req.body.email,
            passwordHash: password,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            role: req.body.role,
        });
        
        // Save the user in the database
        user = await user.save();

        if (!user) {
            return res.status(400).send('The user cannot be created!');
        }

        // Role-based object creation logic
        if (user.role === 'PharmacyOwner') {
            let pharmacy = new Pharmacy({
                pharmacyName: req.body.pharmacyName,
                name: req.body.name,  // Assuming pharmacy name comes in the request
                address: req.body.pharmacyAddress,  // Same for address
                // Add other relevant fields
            });
            pharmacy = await pharmacy.save();

            if (!pharmacy) {
                return res.status(400).send('The pharmacy cannot be created!');
            }
        } else if (user.role === 'Customer') {
            let customer = new Customer({
                user: user._id,
                // Add other relevant customer fields if necessary
            });
            customer = await customer.save();

            if (!customer) {
                return res.status(400).send('The customer cannot be created!');
            }
        }

        res.send(user);
    } catch (error) {
        res.status(500).send('An error occurred during the process: ' + error.message);
    }
});


router.put('/admin/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            isAdmin: true,
        },
        { new: true }
    )

    if (!user)
        return res.status(400).send('the user role cannot be update!')

    res.send(user);
})

router.put('/user/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            isAdmin: false,
        },
        { new: true }
    )

    if (!user)
        return res.status(400).send('the user role cannot be update!')

    res.send(user);
})

router.put('/updateProfile/:id', uploadOptions.single('image'), async (req, res) => {
    console.log(req.body)

    const userExist = await User.findById(req.params.id);
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const file = req.file;
    const fileName = file.filename;
    if (!file) return res.status(400).send('No image in the request');
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/users/`;

    const updateProfile = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            image: `${basePath}${fileName}`,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
        },
        { new: true }
    )

    if (!updateProfile)
        return res.status(400).send('THE USER CANNOT BE UPDATED!')
    res.send(updateProfile);
})

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

router.post('/register', uploadOptions.single('image'), async (req, res) => {
    const file = req.file;
    const fileName = file.filename;
    if (!file) return res.status(400).send('No image in the request');
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/users/`;
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        image: `${basePath}${fileName}`,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,

        // address: req.body.address,
        // street: req.body.street,
        // apartment: req.body.apartment,
        // zip: req.body.zip,
        // city: req.body.city,
        // country: req.body.country,
    })
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')
    res.send(user);
})


router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'the user is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "user not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count)

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    });
})
module.exports = router;