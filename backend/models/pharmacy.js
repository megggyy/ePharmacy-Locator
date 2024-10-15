const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    pharmacyName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    street: {
        type: String,
    },
    barangay: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    image: [{
        type: String
    }],
});

pharmacySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

pharmacySchema.set('toJSON', {
    virtuals: true,
});

exports.PharmacyOwner = mongoose.model('Pharmacy', pharmacySchema);