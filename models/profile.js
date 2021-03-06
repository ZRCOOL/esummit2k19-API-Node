const mongoose = require('mongoose');
const joi = require('joi');

var profileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    fullName: {
        type: String,
        required: true,
        minlength: 1
    },
    uni: {
        type: String,
        required: true,
        minlength: 1
    },
    main_email: {
        type: String,
        required: true,
        minlength: 5
    },
    alt_email: {
        type: String,
        minlength: 5
    },
    roll: {
        type: String,
        minlength: 1
    },
    mob_no: {
        type: String,
        required: true,
        minlength: 10
    },
    w_mob_no: {
        type: String,
        required: true,
        minlength: 10
    },
    profileComplete: {
        type: Boolean,
        default: false
    },
    es_id: {
        type: String,
        required: true,
        unique: true
    },
    seatSafe: {
        type: Boolean,
        default: false
    },
    eventsChosen: [{
        event_name: String
    }],
    selectedTwoEvents: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String,
        required: true
    },
    year: {
        type: Number,
    },
    kiitMailVerifyToken:  String,
    kiitMailVerfyStatus:{
        type: Boolean,
        default: true
    },
    combo_code: {
        type: String
      },
      isPaid: {
          type: Boolean,
          default: false
      },
      id_issued: {
          type: Boolean,
          default: 0
      }
})

function validateSchema(profile) {
    const schema = {

        fullName: joi.string().min(1).max(50).required(),
        alt_email: joi.string().min(5).max(255).email(),
        uni: joi.string().min(1).max(255).required(),
        roll: joi.number(),
        mob_no: joi.number().min(10).required(),
        w_mob_no: joi.number().min(10).required(),
        year: joi.number().min(1),
        gender: joi.string().min(1).required(),
        combo_code: joi
        .string()
        .min(9)
        



    }
    return joi.validate(profile, schema)
}

var Profile = mongoose.model("profile", profileSchema)

module.exports = {
    Profile,
    validate: validateSchema
}