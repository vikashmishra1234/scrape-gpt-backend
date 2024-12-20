const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD, 
    api_key: process.env.CLOUDINARY_API, 
    api_secret: process.env.CLOUDINARY_SECRET
});

const UploadToCloudinary = async (fileBuffer) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    resource_type: 'raw', 
                    format: 'pdf' // Explicitly enforce PDF format 
                },
                (error, result) => {
                    if (error) {
                        console.error("Error while uploading the file:", error);
                        reject(error);
                    } else {
                       
                        console.log("Uploaded file URL:", result.secure_url);
                        resolve({url:result.secure_url,size:result.bytes});
                    }
                }
            );
            // Write the buffer to the upload stream
            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        console.error("Error while uploading to Cloudinary:", error);
        throw error;
    }
};

module.exports = UploadToCloudinary;
