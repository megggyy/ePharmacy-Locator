const mongoose = require('mongoose');

const diseasesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    medicine: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
    }],
})

diseasesSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

diseasesSchema.set('toJSON', {
    virtuals: true,
});


exports.Diseases = mongoose.model('Diseases', diseasesSchema);
