const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    permits: [{
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