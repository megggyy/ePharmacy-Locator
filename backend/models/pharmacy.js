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
            type: Number,
           // required: true,
        },
        longitude: {
            type: Number,
            //required: true,
        },
    },
    businessHours: {
        type: String,
        required: true,
    }
});

pharmacySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

pharmacySchema.set('toJSON', {
    virtuals: true,
});

exports.Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
