const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    permits: [{
        type: String
    }],
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    location: {
        latitude: {
            type: Number,
           // required: true, // Set to `true` if location is mandatory
        },
        longitude: {
            type: Number,
            //required: true, // Set to `true` if location is mandatory
        },
    },
});

pharmacySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

pharmacySchema.set('toJSON', {
    virtuals: true,
});

exports.Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
