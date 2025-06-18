const express = require("express");
const { MedicationCategory } = require("../models/medication-category");
const { Medicine } = require("../models/medicine");
const { PharmacyStock } = require("../models/pharmacyStock");

const { uploadOptions } = require("../utils/cloudinary");
const router = express.Router();

router.post("/create", async (req, res) => {

    let medicationCategory = new MedicationCategory({
        name: req.body.name,
    });

    try {
        medicationCategory = await medicationCategory.save();
        res.send(medicationCategory);
    } catch (err) {
        res.status(400).send("The medication category cannot be created!");
    }
});


router.get('/', async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';

    const filter = includeDeleted
      ? {}
      : {
          $or: [
            { deleted: false },
            { deleted: { $exists: false } }
          ]
        };

    const medicationCategories = await MedicationCategory.find(filter);

    if (!medicationCategories) {
      return res.status(500).json({ success: false, message: "No categories found." });
    }

    res.status(200).send(medicationCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
    const medicationCategory = await MedicationCategory.findById(req.params.id);

    if (!medicationCategory) {
        return res.status(500).json({ message: 'The medication category with the given ID was not found.' });
    }

    res.status(200).send(medicationCategory);
});


router.put("/update/:id", async (req, res) => {
   
    const updatedCategory = await MedicationCategory.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
        },
        { new: true }
    );

    if (!updatedCategory) {
        return res.status(500).json({ message: "The medication category cannot be updated." });
    }

    res.send(updatedCategory);
});

// Soft delete medication category + related medicines + stocks
router.put('/soft-delete/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;

        const category = await MedicationCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Medication category not found!' });
        }

        // Soft delete category
        category.deleted = true;
        await category.save();

        // Soft delete related medicines
        const medicines = await Medicine.find({ category: categoryId });
        const medicineIds = medicines.map(med => med._id);

        await Medicine.updateMany(
            { _id: { $in: medicineIds } },
            { $set: { deleted: true } }
        );

        // Soft delete related pharmacy stocks
        await PharmacyStock.updateMany(
            { medicine: { $in: medicineIds } },
            { $set: { deleted: true } }
        );

        res.status(200).json({
            success: true,
            message: 'Category and related medicines & stocks soft-deleted successfully',
        });
    } catch (error) {
        console.error("Soft delete error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Restore medication category + related medicines + stocks
router.put('/restore/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;

        const category = await MedicationCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Medication category not found!' });
        }

        category.deleted = false;
        await category.save();

        const medicines = await Medicine.find({ category: categoryId });
        const medicineIds = medicines.map(med => med._id);

        await Medicine.updateMany(
            { _id: { $in: medicineIds } },
            { $set: { deleted: false } }
        );

        await PharmacyStock.updateMany(
            { medicine: { $in: medicineIds } },
            { $set: { deleted: false } }
        );

        res.status(200).json({
            success: true,
            message: 'Category and related medicines & stocks restored successfully',
        });
    } catch (error) {
        console.error("Restore error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// router.delete('/delete/:id', async (req, res) => {
//     try {
//         const categoryId = req.params.id;

//         const medicationCategory = await MedicationCategory.findById(categoryId);
//         if (!medicationCategory) {
//             return res.status(404).json({ success: false, message: 'Medication category not found!' });
//         }

//         const medicines = await Medicine.find({ category: categoryId });

//         const medicineIds = medicines.map(med => med._id);

//         await PharmacyStock.deleteMany({ medicine: { $in: medicineIds } });

//         await Medicine.deleteMany({ category: categoryId });

//         await MedicationCategory.findByIdAndRemove(categoryId);

//         return res.status(200).json({ success: true, message: 'Medication category, related medicines, and pharmacy stock deleted successfully!' });

//     } catch (error) {
//         console.error('Error deleting medication category:', error);
//         return res.status(500).json({ success: false, error: error.message });
//     }
// });

module.exports = router;
