const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'dyejp2g4b', 
    api_key: '762179297276874', 
    api_secret: 'jL6A7B2Y40R8bGrojpWyGzCOeXI'
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
