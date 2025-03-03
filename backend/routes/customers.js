const { User } = require('../models/user');
const { Customer } = require('../models/customer');
const { Prescription } = require('../models/prescription')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tesseract = require("tesseract.js");
const Jimp = require("jimp").default;
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs").promises;
const axios = require("axios");
const { uploadOptions } = require('../utils/cloudinary');
const cloudinary = require("cloudinary").v2;

// Update customer's location
router.patch('/:id/update-location', async (req, res) => {
    const { id } = req.params; // This should be the userId from the JWT token
    const { latitude, longitude } = req.body;

    try {
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: 'Latitude and longitude are required.' });
        }

        // Search for the customer by userInfo (assuming userInfo refers to the userId)
        const customer = await Customer.findOne({ 'userInfo': id });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        customer.location = { latitude, longitude };
        await customer.save();

        res.status(200).json({ message: 'Location updated successfully.', location: customer.location });
    } catch (error) {
        res.status(500).json({ message: 'Error updating location.', error });
    }
});

router.post(
  "/scan-prescription",
  (req, res, next) => {
    req.folder = "prescriptions";
    next();
  },
  uploadOptions.single("prescriptions"),
  async (req, res) => {
    try {
      const imageUrl = req.file.path; // Cloudinary URL of original image
      console.log("Processing image:", imageUrl);

      // **STEP 1: DOWNLOAD IMAGE FROM CLOUDINARY**
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data);

      // **STEP 2: CONVERT IMAGE TO TENSOR**
      let imageTensor = tf.node.decodeImage(imageBuffer, 3);

      // **STEP 3: CONVERT TO GRAYSCALE FOR BETTER OCR**
      imageTensor = imageTensor.mean(2).expandDims(-1);

      // **STEP 4: NORMALIZE PIXEL VALUES (0 TO 1 RANGE)**
      imageTensor = imageTensor.div(255.0);

      // **STEP 5: APPLY THRESHOLDING FOR BETTER CONTRAST**
      const threshold = 0.4; // Adjusted threshold for better contrast
      let binarizedTensor = imageTensor.greater(tf.scalar(threshold)).toFloat();

      // **STEP 6: RESTORE PIXEL VALUES (0-255 RANGE)**
      binarizedTensor = binarizedTensor.mul(255).cast("int32");

      // **STEP 7: CONVERT BACK TO IMAGE FORMAT**
      const processedBuffer = await tf.node.encodeJpeg(binarizedTensor);

      // **STEP 8: UPLOAD PROCESSED IMAGE DIRECTLY TO CLOUDINARY**
      const uploadedResponse = await cloudinary.uploader.upload_stream({
        folder: "processed_prescriptions",
      }, async (error, result) => {
        if (error) {
          console.error("Error uploading processed image:", error);
          return res.status(500).json({ error: "Failed to upload processed image" });
        }

        // **STEP 9: PERFORM OCR USING TESSERACT**
        const { data: { text } } = await Tesseract.recognize(processedBuffer, "epharmacy_finetuned", { psm: 6 });
        console.log("Extracted OCR Text:", text);

        res.json({
          message: "Image uploaded, processed, and saved successfully",
          originalImageUrl: imageUrl,
          processedImageUrl: result.secure_url, // Cloudinary URL of processed image
          ocrText: text.trim() || "No text detected",
        });
      });

      // Write processedBuffer to Cloudinary stream
      uploadedResponse.end(processedBuffer);
    } catch (error) {
      console.error("Error during image preprocessing or OCR:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  }
);

router.post("/upload-prescription", async (req, res) => {
  try {
    let { originalImageUrl, processedImageUrl, ocrText, matchedMedicines } = req.body;

    // Ensure matchedMedicines is an array & filter null values
    if (!Array.isArray(matchedMedicines)) {
      matchedMedicines = [];
    } else {
      matchedMedicines = matchedMedicines.filter(med => med); // Remove null values
    }

    const newPrescription = new Prescription({
      originalImageUrl,
      processedImageUrl,
      ocrText,
      matchedMedicines,
    });

    await newPrescription.save();

    res.json({
      message: "Prescription uploaded successfully",
      prescription: newPrescription,
    });
  } catch (error) {
    console.error("Error uploading prescription:", error);
    res.status(500).json({ error: "Failed to upload prescription" });
  }
});


module.exports = router;