const mongoose = require('mongoose');

const medicationCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    deleted: {
    type: Boolean,
    default: false, // Soft delete flag
  }
});

medicationCategorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

medicationCategorySchema.set('toJSON', {
    virtuals: true,
});

exports.MedicationCategory = mongoose.model('MedicationCategory', medicationCategorySchema);
