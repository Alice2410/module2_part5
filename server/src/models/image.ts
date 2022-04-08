import { ObjectId } from 'mongodb';
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
    },
    owner: {
        type: ObjectId,
    }
});

export const Image = mongoose.model('Image', imageSchema);