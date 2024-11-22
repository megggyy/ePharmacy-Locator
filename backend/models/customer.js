const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    images: [{
        type: String
    }],
    disease: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diseases',
        default: null,
    },
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

customerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

customerSchema.set('toJSON', {
    virtuals: true,
});

exports.Customer = mongoose.model('Customer', customerSchema);