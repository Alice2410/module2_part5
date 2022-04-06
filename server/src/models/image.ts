import mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true
    },
    metadata: {
        type: Object,
        required: true
    }
});

export const Image = mongoose.model('Image', imageSchema);