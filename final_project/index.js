const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Middleware to check if the user is authenticated
app.use("/customer/auth/*", function auth(req,res,next){
    // If session authorization is present, then verify the token
    if(req.session.authorization){
        // Get token
        const token = req.session.authorization["accessToken"];
        // Verify token with jwt
        jwt.verify(token, "fingerprint_customer", (err,user)=>{
            // If no error proceed
            if(!err){
                req.user = user;
                next();
            }else{
                return res.status(403).json({message:"Invalid token"});
            }
        });
    }else {
        return res.status(403).json({message:"Not logged in"});
 
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
