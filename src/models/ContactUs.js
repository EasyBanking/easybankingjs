const mongoose = require("mongoose")

const ContactUsSchema = mongoose.Schema({
    Email :{
        type: String,
        required:true
    },
    Message :{
        type :String,
        required:true
    },
    Date :{
        type: Date,
    }
} , { versionKey: false });

const ContactUs = mongoose.model("ContactUs", ContactUsSchema);
module.exports = {ContactUs, ContactUsSchema};
