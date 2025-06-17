const mongoose = require('mongoose');

const barangaySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
      deleted: {
    type: Boolean,
    default: false,
  },
});

barangaySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

barangaySchema.set('toJSON', {
    virtuals: true,
});

exports.Barangay = mongoose.model('Barangay', barangaySchema);
