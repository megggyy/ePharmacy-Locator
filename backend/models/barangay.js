const mongoose = require('mongoose');

const barangaySchema = mongoose.Schema({
    name: {
        type: String,
        //required: true, // Ensures the barangay name is always provided
    },
    description: {
        type: String,
        //required: true, // Ensures a description is always provided
    },
    images: [{
        type: String, // Stores URLs or paths to barangay images
    }],
});


barangaySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

barangaySchema.set('toJSON', {
    virtuals: true,
});

exports.Barangay = mongoose.model('Barangay', barangaySchema);
