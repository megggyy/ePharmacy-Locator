const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
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
    disease: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diseases',
    }
});

customerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

customerSchema.set('toJSON', {
    virtuals: true,
});

exports.Customer = mongoose.model('Customer', customerSchema);