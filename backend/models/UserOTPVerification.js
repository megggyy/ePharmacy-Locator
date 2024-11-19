const mongoose = require('mongoose');

const userOTPVerificationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        // required: true,
    },
    expiresAt: {
        type: Date,
        // required: true,
    },
});

userOTPVerificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userOTPVerificationSchema.set('toJSON', {
    virtuals: true,
});

exports.UserOTPVerification = mongoose.model('UserOTPVerification', userOTPVerificationSchema);
