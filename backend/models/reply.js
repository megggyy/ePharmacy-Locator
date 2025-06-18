const mongoose = require('mongoose');

const replySchema = mongoose.Schema({
    feedback: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
    },
    comment: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

replySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

replySchema.set('toJSON', {
    virtuals: true,
});

exports.Reply = mongoose.model('Reply', replySchema);