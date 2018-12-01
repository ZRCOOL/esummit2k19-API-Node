const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const middleware = require('../middleware/middleware')
const {
    Profile
} = require('../models/profile')
const router = express.Router();
var crypto = require("crypto-js");
var salt = "kiitecellislove"
router.get("/qr-gen", [middleware.isLoggedIn, middleware.isVerified, middleware.isProfileComplete, middleware.isPaid, middleware.hasSeat], async (req, res) => {
    
    var currentUserProfile = await Profile.findOne({
        main_email: req.user.email
    })
    if (!currentUserProfile)
        return res.status(400).send({
            error: "Profile was not found"
        })
    if(currentUserProfile.eventsChosen[1] && currentUserProfile.eventsChosen[2]){
    console.log(currentUserProfile.eventsChosen[1].event_name)
    qr_token = async (currentUserProfile) => {
        return await jwt.sign({
            _id: currentUserProfile.user_id,
            name: currentUserProfile.name,
            email: currentUserProfile.main_email



        }, config.get("jwtPrivateKey"))
    }
    var token = await qr_token(currentUserProfile)
    var enc_token = await crypto.AES.encrypt(token, salt).toString()
    if (!token || !enc_token)
        return res.status(400).send({
            error: "Token were not generated correctly"
        })
    return res.status(200).send({
        succcess: "here is your token make a qr code out of this",
        token: enc_token
    })
    //var dec_token = crypto.AES.decrypt(enc_token, config.get('jwtPrivateKey')).toString(crypto.enc.Utf8);
    //console.log(qr_token(currentUserProfile));
    }
    else{
        return res.status(400).send({
            error: "Chosse events first"
        })
    }

})

/* 

    For the time being just have the user data, the adbility to udate live staus
    of participants will be added later

    Can't do that now have my exams :P 


*/

router.post("/qr-gen", middleware.isAdminLoggedIn, async (req, res) => {
    // if(req.body.token)
    // {
    //     var token =  req.body.token
    // }
    if (!req.body.token)
        return res.status(400).send({
            error: "Token was expected"
        })
    dec_token = await crypto.AES.decrypt(req.body.token, salt).toString(crypto.enc.Utf8);
    console.log(dec_token);
    var decoded = await jwt.verify(dec_token, config.get("jwtPrivateKey"))
    var userProfile = await Profile.findOne({
        main_email: decoded.email
    })
    if (!userProfile)
        return res.status(400).send({
            error: "Wrong jwt token"
        })
    return res.status(200).send({
        success: "Here is the user data use it wisely",
        userData: userProfile
    })
})
module.exports = router;