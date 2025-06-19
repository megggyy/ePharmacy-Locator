const mongoose = require('mongoose');

const pharmacyStockSchema = mongoose.Schema({
    medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
    },
    expirationPerStock: [
        {
            stock: {
                type: Number,
                required: true,
            },
            expirationDate: {
                type: Date,
                default: null,
                required: false,
            },

        }
    ],
    timeStamps: {
        type: String,
        required: true
    },
    price: {
        type: Number,
    },
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

pharmacyStockSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

pharmacyStockSchema.set('toJSON', {
    virtuals: true,
});

exports.PharmacyStock = mongoose.model('PharmacyStock', pharmacyStockSchema);