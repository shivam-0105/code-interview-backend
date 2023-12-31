const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config'); 
const { check , validationResult } = require('express-validator');

const User = require('../models/User');

/*
    @route  : POST users
    @desc   : Register User 
    @access : Public
*/ 
router.post('/' , [
    check('name' , 'Name is required').not().isEmpty(),
    check('email' , 'Please enter a valid email').isEmail(),
    check('password' , 'Please enter password of minimum length : 6').isLength({ min: 6 })
] , async (req , res) => {
    
    const errors = validationResult(req);
    if ( !errors.isEmpty() ) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name , email , password } = req.body;

    try {

        // See if the user exists 
        let user = await User.findOne({ email });

        if ( user ) {
            return res.status(400).json({ errors: [{ msg: "User already exists" }] });
        }

        // Get users gravatar
        const avatar = gravatar.url(email , { s: "200" , r: "pg" , d: "mm" });

        user = new User({
            name , email , avatar , password
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password , salt);

        await user.save();

        // Return jsonwebtoken 
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload , process.env.JWT_SECRET , {
            expiresIn: 3600
        } , (err , token) => {
            if(err) {
                throw err; 
            }
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error :(");
    }
});

module.exports = router;