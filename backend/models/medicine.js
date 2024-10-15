const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    stock: {
        type: String,
        required: true,
    },
    availability: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
    }
})

medicineSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

medicineSchema.set('toJSON', {
    virtuals: true,
});


exports.Medicine = mongoose.model('Medicine', medicineSchema);
