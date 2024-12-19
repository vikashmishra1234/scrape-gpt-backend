const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
    cloud_name: 'dyejp2g4b', 
    api_key: '762179297276874', 
    api_secret: 'jL6A7B2Y40R8bGrojpWyGzCOeXI' // Click 'View API Keys' above to copy your API secret
});
const UploadToCloudinary = async(file)=>{
    try {
        const result = await cloudinary.uploader.upload(file,{resource_type: 'raw'});
        console.log(result.secure_url);
        return result?.secure_url;
    } catch (error) {
        console.log("error while uploading the file",error);
    }
}

module.exports = UploadToCloudinary;