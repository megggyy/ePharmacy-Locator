const { User } = require('../models/user');
const { Pharmacy } = require('../models/pharmacy');
const { Customer } = require('../models/customer');
const { Diseases } = require('../models/disease');
const { UserOTPVerification } = require('../models/UserOTPVerification')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');

const { uploadOptions } = require('../utils/cloudinary'); // Import Cloudinary upload options

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

// Nodemailer stuff

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },

})

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
// router.post(
//     '/register',
//     (req, res, next) => {
//         req.folder = 'users'; // Set the folder name for Cloudinary uploads
//         next();
//     }, uploadOptions.array('permits', 10), async (req, res) => {
//     console.log(req.files);
//     console.log(req.body.diseases);

//     try {
//         // Create user object based on request data
//         let user = new User({
//             email: req.body.email,
//             passwordHash: bcrypt.hashSync(req.body.password, 10),
//             isAdmin: req.body.isAdmin,
//             name: req.body.name,
//             contactNumber: req.body.contactNumber,
//             street: req.body.street,
//             barangay: req.body.barangay,
//             city: req.body.city,
//             role: req.body.role,
//             verified: false,
//         });

//         user = await user.save().then((result) => {
//             sendOTPVerificationEmail(result, res)
//         })

//         if (!user) {
//             return res.status(400).send('The user cannot be created!');
//         }

//         // If the user role is Customer, create a Customer entry
//         if (user.role === 'Customer') {

//             let disease = await Diseases.findOne({ name: req.body.diseases });
//             if (!disease) {
//                 disease = new Diseases({
//                     name: req.body.diseases, 
//                 });

//                 disease = await disease.save();
//                 if (!disease) {
//                     return res.status(400).send('The disease cannot be created!');
//                 }
//             }

//             let customer = new Customer({
//                 userInfo: user.id,
//                 disease: disease.id,
//             });

//             customer = await customer.save();

//             if (!customer) {
//                 return res.status(400).send('The customer cannot be created!');
//             }
//             return res.send(customer);

//         } else if (user.role === 'PharmacyOwner') {
//             // For PharmacyOwner role, handle file uploads and permits
//             const files = req.files;
//             if (!files || files.length === 0) {
//                 return res.status(400).send('No permits in the request');
//             }

//             const permitPaths = files.map(file => file.path); // Cloudinary URLs

//             const newPharmacy = new Pharmacy({
//                 userInfo: user.id,
//                 permits: permitPaths,
//                 location: {
//                     latitude: parseFloat(req.body.latitude),
//                     longitude: parseFloat(req.body.longitude),
//                 },
//             });

//             try {
//                 const savedPharmacy = await newPharmacy.save();
//                 return res.status(201).send(savedPharmacy);
//             } catch (error) {
//                 return res.status(500).json({ success: false, error: error.message });
//             }
//         }

//         return res.send(user);

//     } catch (err) {
//         res.status(500).json({ success: false, error: err.message });
//     }
// });
// router.post(
//     '/register',
//     (req, res, next) => {
//       req.folder = 'users'; // Set the folder name for Cloudinary uploads
//       next();
//     },
//     uploadOptions.array('permits', 10),
//     async (req, res) => {
//       console.log(req.files);
//       console.log(req.body.diseases);
  
//       try {
//         // Create user object based on request data
//         let user = new User({
//           email: req.body.email,
//           passwordHash: bcrypt.hashSync(req.body.password, 10),
//           isAdmin: req.body.isAdmin,
//           name: req.body.name,
//           contactNumber: req.body.contactNumber,
//           street: req.body.street,
//           barangay: req.body.barangay,
//           city: req.body.city,
//           role: req.body.role,
//           verified: false,
//         });
  
//         user = await user.save();
  
//         if (!user) {
//           return res.status(400).send('The user cannot be created!');
//         }
  
//         // Send OTP Verification Email
//         await sendOTPVerificationEmail(user, res);
  
//         // Handle role-specific logic
//         if (user.role === 'Customer') {
//           let disease = await Diseases.findOne({ name: req.body.diseases });
//           if (!disease) {
//             disease = new Diseases({ name: req.body.diseases });
//             disease = await disease.save();
//             if (!disease) {
//               return res.status(400).send('The disease cannot be created!');
//             }
//           }
  
//           const customer = new Customer({
//             userInfo: user.id,
//             disease: disease.id,
//           });
  
//           await customer.save();
//         } else if (user.role === 'PharmacyOwner') {
//           const files = req.files;
//           if (!files || files.length === 0) {
//             return res.status(400).send('No permits in the request');
//           }
  
//           const permitPaths = files.map(file => file.path); // Cloudinary URLs
  
//           const newPharmacy = new Pharmacy({
//             userInfo: user.id,
//             permits: permitPaths,
//             location: {
//               latitude: parseFloat(req.body.latitude),
//               longitude: parseFloat(req.body.longitude),
//             },
//           });
  
//           await newPharmacy.save();
//         }
  
//         // Respond with the user ID
//         return res.status(201).json({ 
//           message: 'Registration successful',
//           userId: user.id, 
//         });
  
//       } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, error: err.message });
//       }
//     }
//   );
  
router.post(
    '/register',
    (req, res, next) => {
        req.folder = 'users'; // Set the folder name for Cloudinary uploads
        next();
    },
    uploadOptions.array('permits', 10),
    async (req, res) => {
        try {
            // Create user object
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
                verified: false,
            });

            user = await user.save();

            if (!user) {
                return res.status(400).send('The user cannot be created!');
            }

            // Send OTP Verification Email
            await sendOTPVerificationEmail({ _id: user.id, email: user.email });

            // Handle role-specific logic
            if (user.role === 'Customer') {
                let disease = await Diseases.findOne({ name: req.body.diseases });
                if (!disease) {
                    disease = new Diseases({ name: req.body.diseases });
                    disease = await disease.save();
                }

                const customer = new Customer({
                    userInfo: user.id,
                    disease: disease.id,
                });

                await customer.save();
            } else if (user.role === 'PharmacyOwner') {
                const files = req.files;
                if (!files || files.length === 0) {
                    return res.status(400).send('No permits in the request');
                }

                const permitPaths = files.map(file => file.path);

                const newPharmacy = new Pharmacy({
                    userInfo: user.id,
                    permits: permitPaths,
                    location: {
                        latitude: parseFloat(req.body.latitude),
                        longitude: parseFloat(req.body.longitude),
                    },
                });

                await newPharmacy.save();
            }

            // Respond with the user ID
            return res.status(201).json({
                message: 'Registration successful',
                userId: user.id,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
);

const sendOTPVerificationEmail = async ({ _id, email }) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`; // Generate OTP

        const mailOptions = {
            from: process.env.AUTH_EMAIL, // Sender address
            to: email, // Receiver's email
            subject: "Verify Your Email", // Subject
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete signup.</p>
                   <p>This code <b>expires in 1 hour</b>.</p>`,
        };

        const hashedOTP = await bcrypt.hash(otp, 10);

        // Save the OTP record to the database
        await UserOTPVerification.create({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000, // 1 hour
        });

        // Send the email
        await transporter.sendMail(mailOptions);

        console.log("OTP email sent successfully.");
        return {
            status: "PENDING",
            message: "Verification OTP email sent.",
            data: { userId: _id, email },
        };
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error(error.message);
    }
};



// const sendOTPVerificationEmail = async () => {
//     try {
//         const otp = `${Math.floor(1000 + Math.random() * 9000)}`


//         //MAIL OPTIONS
//         const mailOptions = {
//             from: process.env.AUTH_EMAIL,
//             to: email,
//             subject: "Verify Your Email",
//             html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete signup </p>
//                   <p>This code <b> expires in 1 hour</b>.</p>`,
//         };

//         //hash otp
//         const saltRounds = 10;

//         const hashedOTP = await bcrypt.hash(otp, saltRounds);
//         const newOTPVerification = await new UserOTPVerification({
//             userId: _id,
//             otp: hashedOTP,
//             createdAt: Date.now(),
//             expiresAt: Date.now() + 3600000,
//         })

//         // save otp record
//         await newOTPVerification.save();
//         await transporter.sendMail(mailOptions);
//         res.json({
//             status: "PENDING",
//             message: "Verification otp email sent",
//             data: {
//                 userId: _id,
//                 email,
//             },
//         });
//     } catch (error) {
//       res.json({
//         status: "FAILED",
//         message: error.message,
//       })
//     }
// }

// verify otp email
router.post('/verifyOTP', async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            throw Error("Empty otp details are not allowed");
        } else {
            const UserOTPVerificationRecords = await UserOTPVerification.find({
                userId,
            });
            if (UserOTPVerificationRecords.length <= 0) {
                //no record found
                throw new Error(
                    "Account record doesn't exist or has been verified already"
                );
            } else {
                // user otp record exists
                const { expiresAt } = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    //user otp has expired
                    await UserOTPVerification.deleteMany({ userId });
                    throw new Error("Code has expired. Please request again");
                } else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP);

                    if (!validOTP) {
                        //supplied otp is wrong
                        throw new Error("Invalid code passed. Check your inbox");
                    } else {
                        //sucess
                        await User.updateOne({ _id: userId }, { verified: true});
                        await UserOTPVerification.deleteMany({userId});
                        res.json({
                            status: "VERIFIED",
                            message: `User email verified successfully.`,
                        })
                    }
                }
            }
        }
    } catch (error) {
      res.json({
        status: "FAILED",
        message: error.message,
      })
    }
});

// resend verification
router.post('/resendOTPVerificationCode', async (req, res) => {
    try {
        let { userId, email } = req.body;

        if (!userId || !email) {
            throw Error("Empty user details are not allowed");
        } else {
            //delete existing records and resend
            await UserOTPVerification.deleteMany({ userId });
            sendOTPVerificationEmail({ _id: userId, email}, res);
        }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        })
    }
})


// Login route
router.post('/login', async (req, res) => {
    console.log(req.body.email);

    try {
        const user = await User.findOne({ email: req.body.email });
        const secret = process.env.secret;

        if (!user) {
            // Email not found
            return res.status(400).json({ success: false, message: 'EMAIL_NOT_FOUND' });
        }

        if (!user.verified) {
            // If user is not verified
            return res.status(400).json({ success: false, message: 'USER_NOT_VERIFIED' });
        }

        if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
            // Password is correct, generate token
            const token = jwt.sign(
                {
                    userId: user.id,
                    isAdmin: user.isAdmin
                },
                secret,
                { expiresIn: '1d' }
            );
            console.log('Login Successful:', token);
            return res.status(200).json({ success: true, user: user.email, token: token });
        } else {
            // Incorrect password
            return res.status(400).json({ success: false, message: 'INCORRECT_PASSWORD' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'SERVER_ERROR' });
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
