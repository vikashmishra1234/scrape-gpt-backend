const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    studentId:{
        type:String,
        required:true
    },
    subjectCode:{
        type:String,
        required:true
    },
    subjectName:{
        type:String,
        required:true
    },
    file:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    year:{
        type:String,
        required:true
    }
})
const Notes = mongoose.model('Notes',notesSchema);
module.exports = Notes;