const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema({
    brandName: {
        type: String,
        required: true,
    },
    compositionOne: {
        type: String,
        required: true,
    },
    compositionTwo: {
        type: String,
    },
});

medicineSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

medicineSchema.set('toJSON', {
    virtuals: true,
});

exports.Medicine = mongoose.model('Medicine', medicineSchema);