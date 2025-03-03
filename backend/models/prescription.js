const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  originalImageUrl: {
    type: String,
    //required: true,
  },
  processedImageUrl: {
    type: String,
    //required: true,
  },
  matchedMedicines: [{ 
    type: String 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

prescriptionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

prescriptionSchema.set('toJSON', {
    virtuals: true,
});

exports.Prescription = mongoose.model('Prescription', prescriptionSchema);