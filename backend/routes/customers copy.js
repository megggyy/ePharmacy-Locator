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
const cv = require("@u4/opencv4nodejs"); // OpenCV
const sharp = require("sharp");
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

// router.post(
//   "/scan-prescription",
//   (req, res, next) => {
//     req.folder = "prescriptions";
//     next();
//   },
//   uploadOptions.single("prescriptions"),
//   async (req, res) => {
//     try {
//       const imageUrl = req.file.path; // Cloudinary URL of original image
//       console.log("Processing image:", imageUrl);

//       // **STEP 1: DOWNLOAD IMAGE FROM CLOUDINARY**
//       const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
//       const imageBuffer = Buffer.from(response.data);

//       // =========================== 🟢 OPENCV PREPROCESSING 🟢 ===========================
//       let imgMat = cv.imdecode(imageBuffer); // Convert Buffer to OpenCV Mat

//       // **Convert to Grayscale**
//       imgMat = imgMat.bgrToGray();

//       // **Apply Bilateral Filter for Noise Reduction (preserves edges)**
//       imgMat = imgMat.bilateralFilter(10, 75, 75);

//       // **Morphological Closing to Fill Gaps in Text**
//       const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
//       imgMat = imgMat.morphologyEx(kernel, cv.MORPH_CLOSE);

//       // **Adaptive Thresholding for Dynamic Contrast**
//       imgMat = imgMat.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 5);

//       // **Unsharp Masking to Enhance Sharpness**
//       const gaussianBlur = imgMat.gaussianBlur(new cv.Size(0, 0), 3);
//       imgMat = imgMat.addWeighted(1.5, gaussianBlur, -0.5, 0);

//       // **Sharpening Kernel to Boost Text Visibility**
//       const sharpenKernel = new cv.Mat([
//         [-1, -1, -1],
//         [-1,  9, -1],
//         [-1, -1, -1]
//       ], cv.CV_32F);
//       imgMat = imgMat.filter2D(cv.CV_8U, sharpenKernel);

//       // **Convert OpenCV Processed Image to Buffer**
//       const processedBufferOpenCV = cv.imencode(".jpg", imgMat);

//       // =========================== 🔵 TENSORFLOW PREPROCESSING 🔵 ===========================
//       // **Convert Image to Tensor**
//       let imageTensor = tf.node.decodeImage(processedBufferOpenCV, 3);

//       // **Convert to Grayscale Again for Consistency**
//       imageTensor = imageTensor.mean(2).expandDims(-1);

//       // **Normalize Pixel Values (0 to 1)**
//       imageTensor = imageTensor.div(255.0);

//       // **Apply Thresholding for Better OCR**
//       const threshold = 0.5;
//       let binarizedTensor = imageTensor.greater(tf.scalar(threshold)).toFloat();

//       // **Restore Pixel Values (0-255)**
//       binarizedTensor = binarizedTensor.mul(255).cast("int32");

//       // **Convert Back to Image Format**
//       const processedBufferTensorFlow = await tf.node.encodeJpeg(binarizedTensor);

//       // =========================== 🔴 UPLOAD PROCESSED IMAGE TO CLOUDINARY 🔴 ===========================
//       cloudinary.uploader.upload_stream(
//         { folder: "processed_prescriptions" },
//         async (error, result) => {
//           if (error) {
//             console.error("Error uploading processed image:", error);
//             return res.status(500).json({ error: "Failed to upload processed image" });
//           }

//           // =========================== 🟠 OCR USING TESSERACT 🟠 ===========================
//           const { data: { text } } = await Tesseract.recognize(processedBufferTensorFlow, "epharmacy_finetuned", { psm: 6 });
//           console.log("Extracted OCR Text:", text);

//           res.json({
//             message: "Image uploaded, processed, and saved successfully",
//             originalImageUrl: imageUrl,
//             processedImageUrl: result.secure_url, // Cloudinary URL of processed image
//             ocrText: text.trim() || "No text detected",
//           });
//         }
//       ).end(processedBufferTensorFlow);
//     } catch (error) {
//       console.error("Error during image preprocessing or OCR:", error);
//       res.status(500).json({ error: "Failed to process image" });
//     }
//   }
// );

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

      // =========================== 🟢 OPENCV STROKE ENHANCEMENT 🟢 ===========================

      // Convert Buffer to OpenCV Mat
      let imgMat = cv.imdecode(imageBuffer);

      // Convert to Grayscale
      imgMat = imgMat.bgrToGray();

      // Apply Dilation to Thicken Strokes
      // const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(1, 1)); 
      // imgMat = imgMat.dilate(kernel, new cv.Point(-1, -1), 1); // 1 iteration      

      // Step 1: Invert the image (Black → White, White → Black)
      imgMat = imgMat.bitwiseNot();

      // Step 2: Apply Dilation
      const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(2, 2));
      imgMat = imgMat.dilate(kernel, new cv.Point(-1, -1), 1); // Increase iterations for more thickness

      // Step 3: Invert the image back to original colors
      imgMat = imgMat.bitwiseNot();

      // Convert Back to Buffer for TensorFlow Processing
      const processedBufferOpenCV = cv.imencode(".jpg", imgMat);

      // =========================== 🔵 TENSORFLOW PREPROCESSING 🔵 ===========================
      
      // Convert OpenCV-processed image to Tensor
      let imageTensor = tf.node.decodeImage(processedBufferOpenCV, 3);

      // Convert to Grayscale for OCR Consistency
      imageTensor = imageTensor.mean(2).expandDims(-1);

      // Normalize Pixel Values (0 to 1)
      imageTensor = imageTensor.div(255.0);

      // Apply Thresholding for Better OCR
      const threshold = 0.5; // Adjusted threshold for better contrast
      let binarizedTensor = imageTensor.greater(tf.scalar(threshold)).toFloat();

      // Restore Pixel Values (0-255)
      binarizedTensor = binarizedTensor.mul(255).cast("int32");

      // Convert Back to Image Format
      const processedBuffer = await tf.node.encodeJpeg(binarizedTensor);

      // =========================== 🔴 UPLOAD PROCESSED IMAGE TO CLOUDINARY 🔴 ===========================

      const uploadedResponse = await cloudinary.uploader.upload_stream(
        { folder: "processed_prescriptions" },
        async (error, result) => {
          if (error) {
            console.error("Error uploading processed image:", error);
            return res.status(500).json({ error: "Failed to upload processed image" });
          }

          // =========================== 🟠 OCR USING TESSERACT 🟠 ===========================
          const { data: { text } } = await Tesseract.recognize(processedBuffer, "epharmacy_finetunedver2", { psm: 6 });
          console.log("Extracted OCR Text:", text);

          res.json({
            message: "Image uploaded, processed, and saved successfully",
            originalImageUrl: imageUrl,
            processedImageUrl: result.secure_url, // Cloudinary URL of processed image
            ocrText: text.trim() || "No text detected",
          });
        }
      );

      // Write processedBuffer to Cloudinary stream
      uploadedResponse.end(processedBuffer);
    } catch (error) {
      console.error("Error during image preprocessing or OCR:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  }
);

// router.post(
//   "/scan-prescription",
//   (req, res, next) => {
//     req.folder = "prescriptions";
//     next();
//   },
//   uploadOptions.single("prescriptions"),
//   async (req, res) => {
//     try {
//       const imageUrl = req.file.path; // Cloudinary URL of original image
//       console.log("Processing image:", imageUrl);
//       console.log(cv);

//       // **STEP 1: DOWNLOAD IMAGE FROM CLOUDINARY**
//       const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
//       const imageBuffer = Buffer.from(response.data);

//       // Convert Buffer to OpenCV Mat
//       let imgMat = cv.imdecode(imageBuffer);

//       // ===================== 🟢 AUTO-CROPPING USING OPENCV 🟢 =====================

//       // Convert to Grayscale
//       let gray = imgMat.bgrToGray();

//       // Apply Gaussian Blur to reduce noise
//       gray = gray.gaussianBlur(new cv.Size(5, 5), 0);

//       // Edge detection using Canny
//       let edges = gray.canny(50, 150);

//       // Find contours
//       let contours = new cv.MatVector();
//       let hierarchy = new cv.Mat();
//       cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

//       let biggestContour = null;
//       let maxArea = 0;

//       for (let i = 0; i < contours.size(); i++) {
//         let contour = contours.get(i);
//         let area = cv.contourArea(contour);
//         if (area > maxArea) {
//           maxArea = area;
//           biggestContour = contour;
//         }
//       }

//       if (biggestContour) {
//         // Approximate contour to get a 4-sided polygon
//         let perimeter = cv.arcLength(biggestContour, true);
//         let approx = cv.approxPolyDP(biggestContour, 0.02 * perimeter, true);

//         if (approx.rows === 4) {
//           // Define source and destination points for perspective transform
//           let srcPts = approx.data32S;
//           let rect = [
//             new cv.Point(srcPts[0], srcPts[1]),
//             new cv.Point(srcPts[2], srcPts[3]),
//             new cv.Point(srcPts[4], srcPts[5]),
//             new cv.Point(srcPts[6], srcPts[7]),
//           ];

//           // Order points correctly (Top-left, Top-right, Bottom-right, Bottom-left)
//           rect.sort((a, b) => a.x + a.y - (b.x + b.y));

//           let [tl, tr, br, bl] = rect;

//           let widthA = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
//           let widthB = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
//           let maxWidth = Math.max(Math.floor(widthA), Math.floor(widthB));

//           let heightA = Math.sqrt(Math.pow(tr.x - br.x, 2) + Math.pow(tr.y - br.y, 2));
//           let heightB = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2));
//           let maxHeight = Math.max(Math.floor(heightA), Math.floor(heightB));

//           // Destination points for perspective transform
//           let dstPts = [
//             new cv.Point(0, 0),
//             new cv.Point(maxWidth - 1, 0),
//             new cv.Point(maxWidth - 1, maxHeight - 1),
//             new cv.Point(0, maxHeight - 1),
//           ];

//           // Apply perspective transform
//           let transformMatrix = cv.getPerspectiveTransform(rect, dstPts);
//           let croppedMat = new cv.Mat();
//           cv.warpPerspective(imgMat, croppedMat, transformMatrix, new cv.Size(maxWidth, maxHeight));

//           imgMat = croppedMat; // Replace the original image with the cropped version
//         }
//       }

//       // =========================== 🟢 OPENCV STROKE ENHANCEMENT 🟢 ===========================

//       // Convert to Grayscale
//       imgMat = imgMat.bgrToGray();

//       // Step 1: Invert the image (Black → White, White → Black)
//       imgMat = imgMat.bitwiseNot();

//       // Step 2: Apply Dilation to Thicken Strokes
//       const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(2, 2));
//       imgMat = imgMat.dilate(kernel, new cv.Point(-1, -1), 1);

//       // Step 3: Invert the image back to original colors
//       imgMat = imgMat.bitwiseNot();

//       // Convert Back to Buffer for TensorFlow Processing
//       const processedBufferOpenCV = cv.imencode(".jpg", imgMat);

//       // =========================== 🔵 TENSORFLOW PREPROCESSING 🔵 ===========================

//       let imageTensor = tf.node.decodeImage(processedBufferOpenCV, 3);
//       imageTensor = imageTensor.mean(2).expandDims(-1);
//       imageTensor = imageTensor.div(255.0);

//       // Apply Thresholding for Better OCR
//       const threshold = 0.5;
//       let binarizedTensor = imageTensor.greater(tf.scalar(threshold)).toFloat();
//       binarizedTensor = binarizedTensor.mul(255).cast("int32");

//       // Convert Back to Image Format
//       const processedBuffer = await tf.node.encodeJpeg(binarizedTensor);

//       // =========================== 🔴 UPLOAD PROCESSED IMAGE TO CLOUDINARY 🔴 ===========================

//       const uploadedResponse = await cloudinary.uploader.upload_stream(
//         { folder: "processed_prescriptions" },
//         async (error, result) => {
//           if (error) {
//             console.error("Error uploading processed image:", error);
//             return res.status(500).json({ error: "Failed to upload processed image" });
//           }

//           // =========================== 🟠 OCR USING TESSERACT 🟠 ===========================
//           const { data: { text } } = await Tesseract.recognize(processedBuffer, "epharmacy_finetuned", { psm: 6 });
//           console.log("Extracted OCR Text:", text);

//           res.json({
//             message: "Image uploaded, processed, and saved successfully",
//             originalImageUrl: imageUrl,
//             processedImageUrl: result.secure_url, // Cloudinary URL of processed image
//             ocrText: text.trim() || "No text detected",
//           });
//         }
//       );

//       // Write processedBuffer to Cloudinary stream
//       uploadedResponse.end(processedBuffer);
//     } catch (error) {
//       console.error("Error during image preprocessing or OCR:", error);
//       res.status(500).json({ error: "Failed to process image" });
//     }
//   }
// );


// router.post(
//   "/scan-prescription",
//   (req, res, next) => {
//     req.folder = "prescriptions";
//     next();
//   },
//   uploadOptions.single("prescriptions"),
//   async (req, res) => {
//     try {
//       const imageUrl = req.file.path; // Cloudinary URL of original image
//       console.log("Processing image:", imageUrl);

//       // **STEP 1: DOWNLOAD IMAGE FROM CLOUDINARY**
//       const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
//       const imageBuffer = Buffer.from(response.data);

//       // =========================== 🟢 OPENCV PREPROCESSING 🟢 ===========================
//       let imgMat = cv.imdecode(imageBuffer); // Convert Buffer to OpenCV Mat

//       // **Convert to Grayscale**
//       imgMat = imgMat.bgrToGray();

//       // **Apply Gaussian Blur for Noise Reduction (preserves strokes better)**
//       imgMat = imgMat.gaussianBlur(new cv.Size(5, 5), 1.5);

//       // **Morphological Closing to Fill Gaps in Text (Preserve Stroke Integrity)**
//       const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
//       imgMat = imgMat.morphologyEx(kernel, cv.MORPH_CLOSE);

//       // **Adaptive Thresholding for Dynamic Contrast**
//       imgMat = imgMat.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 15, 5);

//       // **Enhance Edges Using Laplacian Filter**
//       const laplacian = imgMat.laplacian(cv.CV_8U, 3);
//       imgMat = imgMat.addWeighted(1.5, laplacian, -0.5, 0);

//       // **Final Sharpening to Improve Text Readability**
//       const sharpenKernel = new cv.Mat([
//         [0, -1, 0],
//         [-1, 5, -1],
//         [0, -1, 0]
//       ], cv.CV_32F);
//       imgMat = imgMat.filter2D(cv.CV_8U, sharpenKernel);

//       // **Convert OpenCV Processed Image to Buffer**
//       const processedBufferOpenCV = cv.imencode(".jpg", imgMat);

//       // =========================== 🔵 TENSORFLOW PREPROCESSING 🔵 ===========================
//       // **Convert Image to Tensor**
//       let imageTensor = tf.node.decodeImage(processedBufferOpenCV, 3);

//       // **Convert to Grayscale Again for Consistency**
//       imageTensor = imageTensor.mean(2).expandDims(-1);

//       // **Normalize Pixel Values (0 to 1)**
//       imageTensor = imageTensor.div(255.0);

//       // **Apply Thresholding for Better OCR**
//       const threshold = 0.5;
//       let binarizedTensor = imageTensor.greater(tf.scalar(threshold)).toFloat();

//       // **Restore Pixel Values (0-255)**
//       binarizedTensor = binarizedTensor.mul(255).cast("int32");

//       // **Convert Back to Image Format**
//       const processedBufferTensorFlow = await tf.node.encodeJpeg(binarizedTensor);

//       // =========================== 🔴 UPLOAD PROCESSED IMAGE TO CLOUDINARY 🔴 ===========================
//       cloudinary.uploader.upload_stream(
//         { folder: "processed_prescriptions" },
//         async (error, result) => {
//           if (error) {
//             console.error("Error uploading processed image:", error);
//             return res.status(500).json({ error: "Failed to upload processed image" });
//           }

//           // =========================== 🟠 OCR USING TESSERACT 🟠 ===========================
//           const { data: { text } } = await Tesseract.recognize(processedBufferTensorFlow, "epharmacy_finetuned", { psm: 6 });
//           console.log("Extracted OCR Text:", text);

//           res.json({
//             message: "Image uploaded, processed, and saved successfully",
//             originalImageUrl: imageUrl,
//             processedImageUrl: result.secure_url, // Cloudinary URL of processed image
//             ocrText: text.trim() || "No text detected",
//           });
//         }
//       ).end(processedBufferTensorFlow);
//     } catch (error) {
//       console.error("Error during image preprocessing or OCR:", error);
//       res.status(500).json({ error: "Failed to process image" });
//     }
//   }
// );

// router.post(
//   "/scan-prescription",
//   (req, res, next) => {
//     req.folder = "prescriptions";
//     next();
//   },
//   uploadOptions.single("prescriptions"),
//   async (req, res) => {
//     try {
//       const imageUrl = req.file.path;
//       console.log("Processing image:", imageUrl);

//       // **STEP 1: DOWNLOAD IMAGE FROM CLOUDINARY**
//       const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
//       const imageBuffer = Buffer.from(response.data);

//       // **STEP 2: CONVERT IMAGE TO TENSOR & GRAYSCALE**
//       let imageTensor = tf.node.decodeImage(imageBuffer, 3).mean(2).expandDims(-1);

//       // **STEP 3: NORMALIZE PIXEL VALUES (0 TO 1)**
//       imageTensor = imageTensor.div(255.0);

//       // **STEP 4: APPLY IMAGE ENHANCEMENTS**
//       const threshold = 0.45; // Adjusted for better contrast
//       let binarizedTensor = imageTensor.greater(tf.scalar(threshold)).toFloat();

//       // **STEP 5: APPLY GAUSSIAN BLUR (DENOISE)**
//       binarizedTensor = tf.image.gaussianFilter2d(binarizedTensor, [3, 3], 1.5);

//       // **STEP 6: APPLY SHARPENING TO ENHANCE TEXT**
//       const sharpenKernel = tf.tensor2d([
//         [0, -1, 0],
//         [-1, 5, -1],
//         [0, -1, 0]
//       ], [3, 3]);
//       binarizedTensor = tf.conv2d(binarizedTensor.expandDims(0), sharpenKernel.expandDims(-1), 1, "same").squeeze();

//       // **STEP 7: CONVERT BACK TO IMAGE FORMAT**
//       const processedBuffer = await tf.node.encodeJpeg(binarizedTensor.mul(255).cast("int32"));

//       // **STEP 8: UPLOAD PROCESSED IMAGE TO CLOUDINARY**
//       const uploadedResponse = await new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream({ folder: "processed_prescriptions" },
//           (error, result) => error ? reject(error) : resolve(result)
//         );
//         uploadStream.end(processedBuffer);
//       });

//       // **STEP 9: PERFORM OCR WITH BETTER CONFIGURATION**
//       const { data: { text } } = await Tesseract.recognize(
//         processedBuffer,
//         "epharmacy_finetuned",
//         {
//           psm: 4, // Change to PSM 4 (Assumes columns of text)
//           tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-+", // Restrict characters
//         }
//       );
//       console.log("Extracted OCR Text:", text);

//       // **STEP 10: CLEAN UP OCR OUTPUT FOR BETTER MATCHING**
//       const cleanedText = text
//         .replace(/[^a-zA-Z0-9\s-+]/g, "") // Remove special characters
//         .replace(/\b[A-Z]{1,2}\b/g, "") // Remove single/double-letter noise
//         .replace(/\s{2,}/g, " ") // Reduce multiple spaces
//         .trim();

//       res.json({
//         message: "Image uploaded, processed, and saved successfully",
//         originalImageUrl: imageUrl,
//         processedImageUrl: uploadedResponse.secure_url,
//         ocrText: cleanedText || "No text detected",
//       });
//     } catch (error) {
//       console.error("Error during image preprocessing or OCR:", error);
//       res.status(500).json({ error: "Failed to process image" });
//     }
//   }
// );

router.post("/upload-prescription", async (req, res) => {
  try {
    let { originalImageUrl, processedImageUrl, ocrText, matchedMedicines, customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required." });
    }

    if (!Array.isArray(matchedMedicines)) {
      matchedMedicines = [];
    } else {
      matchedMedicines = matchedMedicines.filter(med => med);
    }

    const newPrescription = new Prescription({
      originalImageUrl,
      processedImageUrl,
      ocrText,
      matchedMedicines,
      customerId,
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


router.get("/:customerId/prescriptions", async (req, res) => {
  try {
    const { customerId } = req.params;
    const prescriptions = await Prescription.find({ customerId }).sort({ createdAt: -1 });

    if (!prescriptions.length) {
      return res.status(404).json({ message: "No prescriptions found." });
    }

    res.json({ prescriptions });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ error: "Failed to fetch prescriptions." });
  }
});

router.get("/mostScannedMedicines", async (req, res) => {
  try {
    const medicineCounts = await Prescription.aggregate([
      { $unwind: "$matchedMedicines" }, // Split matchedMedicines array
      {
        $group: {
          _id: "$matchedMedicines",
          count: { $sum: 1 }, // Count occurrences
        },
      },
      { $sort: { count: -1 } }, // Sort by highest count
      { $limit: 10 }, // Limit to top 10 medicines
    ]);

    if (!medicineCounts || medicineCounts.length === 0) {
      return res.status(404).json({ message: "No scanned medicines found." });
    }

    res.status(200).json({
      success: true,
      mostScannedMedicines: medicineCounts,
    });
  } catch (error) {
    console.error("Error fetching most scanned medicines:", error);
    res.status(500).json({ message: "An error occurred while fetching data." });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
      const customer = await Customer.findOne({ userInfo: req.params.userId });
      if (!customer) return res.status(404).json({ message: 'Customer not found' });

      res.json({ customerId: customer._id });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching customer ID', error });
  }
});

router.get("/customers/:customerId", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ consentGiven: customer.consentGiven });
  } catch (error) {
    res.status(500).json({ message: "Error fetching consent", error });
  }
});

// Update user consent
router.post("/customers/consent", async (req, res) => {
  try {
    const { customerId, consentGiven } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.consentGiven = consentGiven;
    await customer.save();

    res.status(200).json({ message: "Consent updated successfully", consentGiven });
  } catch (error) {
    res.status(500).json({ message: "Error updating consent", error });
  }
});


module.exports = router;