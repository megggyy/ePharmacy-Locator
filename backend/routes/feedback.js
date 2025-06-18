const express = require("express");
const { Feedback } = require("../models/feedback");
const { Reply } = require("../models/reply");
const { Pharmacy } = require("../models/pharmacy");
const { Customer } = require("../models/customer");
const mongoose = require('mongoose');


const router = express.Router();

router.get('/pharmacy-rating-distribution', async (req, res) => {
    try {
        // Aggregate to calculate average ratings per pharmacy
        const ratingData = await Feedback.aggregate([
            {
                $group: {
                    _id: "$pharmacy",
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        // Define rating ranges
        const ratingRanges = {
            "0-1": 0,
            "1.01-2": 0,
            "2.01-3": 0,
            "3.01-4": 0,
            "4.01-5": 0
        };

        // Categorize pharmacies based on average rating
        ratingData.forEach(({ averageRating }) => {
            if (averageRating >= 0 && averageRating <= 1) ratingRanges["0-1"]++;
            else if (averageRating > 1 && averageRating <= 2) ratingRanges["1.01-2"]++;
            else if (averageRating > 2 && averageRating <= 3) ratingRanges["2.01-3"]++;
            else if (averageRating > 3 && averageRating <= 4) ratingRanges["3.01-4"]++;
            else if (averageRating > 4 && averageRating <= 5) ratingRanges["4.01-5"]++;
        });

        res.status(200).json(ratingRanges);
    } catch (error) {
        console.error("Error fetching pharmacy rating distribution:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/reply/:id", async (req, res) => {
    const { comment } = req.body;
    const { id } = req.params;

    if (!comment) {
        return res.status(400).json({ error: "Comment is required." });
    }

    try {
        // Create new reply (don't check if it exists)
        const newReply = new Reply({
            comment,
            feedback: id,
        });
        const savedReply = await newReply.save();

        return res.status(201).json(savedReply);
    } catch (error) {
        console.error("Error creating reply:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.put("/reply/:id", async (req, res) => {
    const { comment } = req.body;
    const { id } = req.params;

    if (!comment) {
        return res.status(400).json({ error: "Comment is required." });
    }

    try {
        const existingReply = await Reply.findOne({ feedback: id });

        if (!existingReply) {
            return res.status(404).json({ error: "Reply not found." });
        }

        existingReply.comment = comment;
        existingReply.timestamp = new Date();
        const updatedReply = await existingReply.save();

        return res.status(200).json(updatedReply);
    } catch (error) {
        console.error("Error updating reply:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/checkReply/:id', async (req, res) => {
    const { feedbackId } = req.query;

    try {
        const query = { feedback: req.params.id };

        if (feedbackId) {
            query.feedback = feedbackId;
        }

        const feedbacks = await Reply.find(query).lean();

        if (feedbacks.length > 0) {
            return res.status(200).json({ exists: true, feedbacks });
        } else {
            return res.status(200).json({ exists: false, message: "No feedback found for this customer." });
        }
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/fetchReplies', async (req, res) => {
  try {
    const replies = await Reply.find({}).lean();

    if (replies.length > 0) {
      const groupedReplies = {};

      replies.forEach(reply => {
        if (!groupedReplies[reply.feedback]) {
          groupedReplies[reply.feedback] = [];
        }
        groupedReplies[reply.feedback].push({
          comment: reply.comment,
          timestamp: reply.timestamp,
        });
      });

      console.log(groupedReplies)
      res.status(200).json({ exists: true, replies: groupedReplies });
    } else {
      res.status(200).json({ exists: false, message: "No replies found." });
    }
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



router.delete('/reply-delete/:id', async (req, res) => {
    try {

        const feedbacks = await Reply.findByIdAndRemove(req.params.id);

        if (!feedbacks) {
            return res.status(500).json({ message: "The feedback cannot be deleted." });
        }

        res.send(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/create", async (req, res) => {
    const { customer, rating, comment, pharmacy, name } = req.body;
    console.log("Received request body:", req.body);

    let feedback = new Feedback({
        customer: customer || null, // Ensures null if customer is missing
        rating: rating,
        name: name,
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
            .populate('customer')
            .lean();

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching medicine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/customer/:id', async (req, res) => {
  const { pharmacyId } = req.query;

  try {
    if (!pharmacyId) {
      return res.status(400).json({ success: false, message: "Missing pharmacyId" });
    }

    const feedback = await Feedback.findOne({
      customer: req.params.id,
      pharmacy: pharmacyId
    }).lean();

    if (feedback) {
      return res.status(200).json({ exists: true, feedback });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.put('/update/:id', async (req, res) => {
    try {

        const { rating, comment, name } = req.body;

        const feedbacks = await Feedback.findByIdAndUpdate(
            req.params.id,
            {
                rating: rating,
                comment: comment,
                name: name,
            },
            { new: true }
        );

        if (!feedbacks) {
            return res.status(500).json({ message: "The feedback category cannot be updated." });
        }

        res.send(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        // Delete the Feedback
        const deletedFeedback = await Feedback.findByIdAndRemove(req.params.id);

        if (!deletedFeedback) {
            return res.status(404).json({ message: "The feedback cannot be deleted." });
        }

        // Delete associated Replies
        await Reply.deleteMany({ feedback: req.params.id });

        res.status(200).json({
            message: "Feedback and related replies deleted successfully.",
            feedback: deletedFeedback
        });

    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


router.get('/pharmacy/:id', async (req, res) => {
    try {
        // Find the pharmacy by its ID and include the userInfo field
        const pharmacy = await Pharmacy.findOne({ userInfo: req.params.id })
            .lean();

        if (!pharmacy) {
            return res.status(400).json({ success: false, message: "Pharmacy not found" });
        }

        const feedbacks = await Feedback.find({ pharmacy: pharmacy._id })
            .populate('customer')
            .lean();

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching medicine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/updateFetch/:id', async (req, res) => {
    try {
        const feedbacks = await Feedback.findById(req.params.id)
            .populate('customer')
            .lean();

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching medicine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/chart/:pharmacyId', async (req, res) => {
    try {
        const pharmacyId = req.params.pharmacyId;

        // Aggregate feedback to count occurrences of each rating
        const ratingsData = await Feedback.aggregate([
            { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId) } },
            { $group: { _id: "$rating", count: { $sum: 1 } } }
        ]);

        // Prepare response with counts for ratings 1-5, defaulting to 0 if missing
        const ratingsCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingsData.forEach(r => { ratingsCount[r._id] = r.count; });

        res.status(200).json(ratingsCount);
    } catch (error) {
        console.error("Error fetching ratings data:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});




module.exports = router;
