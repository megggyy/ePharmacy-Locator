const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    images: [{
        type: String
    }],
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    location: {
        latitude: {
            type: String,
        },
        longitude: {
            type: String,
        },
    },
    approved:
    {
        type: Boolean
    }

    // businessDays: {
    //     type: String,
    //     required: true,
    // },
    // businessOpen: {
    //     type: String,
    //     required: true,
    // },
    // businessClose: {
    //     type: String,
    //     required: true,
    // }
});

pharmacySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

pharmacySchema.set('toJSON', {
    virtuals: true,
});

exports.Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
