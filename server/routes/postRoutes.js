import express from 'express';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../mongodb/models/post.js';

dotenv.config();
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.route('/').get(async (req, res) => {
    try {
        const posts = await Post.find({});
        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fetching posts failed, please try again' });
    }
});

router.route('/').post(async (req, res) => {
    try {
        const { name, prompt, photo } = req.body;

        // Upload the photo to Cloudinary
        const photoUrl = await cloudinary.uploader.upload(photo);

        // Create a new post using the Post model
        const newPost = await Post.create({
            name,
            prompt,
            photo: photoUrl.url,
        });
        // console.log(newPost);
        res.status(200).json({ success: true, data: newPost });
    } catch (err) {
        if (err.name === "ValidationError") {
            // Handle validation errors
            res.status(400).json({ success: false, message: err.message });
        } else {
            // Handle other errors
            console.error(err);
            res.status(500).json({ success: false, message: 'Unable to create a post, please try again' });
        }
    }
});



export default router;
