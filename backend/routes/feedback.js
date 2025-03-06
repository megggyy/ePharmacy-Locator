const express = require("express");
const { Feedback } = require("../models/feedback");
const { Pharmacy } = require("../models/pharmacy");
const { Customer } = require("../models/customer");

const router = express.Router();

router.post("/create", async (req, res) => {
    const { customer, rating, comment, pharmacy } = req.body;
    console.log("Received request body:", req.body);

    let feedback = new Feedback({
        customer: customer || null, // Ensures null if customer is missing
        rating: rating,
        comment: comment,
        pharmacy: pharmacy
    });

    console.log("Feedback before saving:", feedback); // Debugging log

    try {
        feedback = await feedback.save();
        console.log("Saved feedback:", feedback); // Log the saved feedback
        res.send(feedback);
    } catch (err) {
        console.error("Error saving feedback:", err);
        res.status(400).send("The feedback cannot be created!");
    }
});



router.get('/:id', async (req, res) => {
    try {
        // Find the pharmacy by its ID and include the userInfo field
        const pharmacy = await Pharmacy.findById(req.params.id);

        if (!pharmacy) {
            return res.status(400).json({ success: false, message: "Pharmacy not found" });
        }

        const feedbacks = await Feedback.find({ pharmacy: req.params.id })
            .populate('customer', null, { strictPopulate: false })
            .lean();

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching medicine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
