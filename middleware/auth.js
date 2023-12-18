const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req , res , next) => {
    // get token from the header -> when we send request to protected route, we need to send the token within the header
    const token = req.header('x-auth-token');

    // check if no token 
    if ( !token ) {
        return res.status(401).json({ msg: "No token, authorization denied :(" });
    }

    // Verifying the token 
    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch(err) {
        return res.status(401).json({ msg: "Token is not valid" });
    }
}