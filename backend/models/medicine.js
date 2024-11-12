const mongoose = require('mongoose'); 

const medicineSchema = mongoose.Schema({
    name: {
        type: String,
        // required: true,
    },
    description: {
        type: String,
        // required: true,
    },
    stock: {
        type: Number, 
        // required: true,
    },
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        // required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicationCategory',
        // required: true,
    },
    images: [{
        type: String,
    }],
});

medicineSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

medicineSchema.set('toJSON', {
    virtuals: true,
});

exports.Medicine = mongoose.model('Medicine', medicineSchema);
