/***
 * 
 *  Very soon I will be commenting the entire code. Don't worry.
 * 
 *  I intend to use it every year.
 * 
 *  And if everything goes well then, I can modify this API for Icamp as well.
 * 
 * ===============================
 * (: LET'S MAKE E-SUMMIT GREAT :) 
 * ===============================
 * 
 *
 */
const express = require('express');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const config = require("config");
const bodyParser = require('body-parser');
const session = require('express-session');
// var csrf = require('csurf');
var cookieParser = require('cookie-parser')
var cors = require('cors');
const hpp = require('hpp');
const helmet = require('helmet')
var compression = require('compression')
var contentLength = require('express-content-length-validator');
var MAX_CONTENT_LENGTH_ACCEPTED = 9999;
const jwt = require('jsonwebtoken');
require('../db/connection');

//const QRCode = require('qrcode');
//custom imports

if (!config.get('jwtPrivateKey') && !process.env.SALT && !process.env.SESSION_SECRET && !process.env.password) {
  console.log("FATAL ERROR: keys not defined");
  process.exit(1);
}




const commonRoutes = require('../routes/common');
const authRoutes = require('../routes/auth');
const profileRoutes = require('../routes/profile')
const dashboardRoutes = require('../routes/dashboard')
const forgotRoutes = require('../routes/forgot')
const {
  paymentRoutes,
  requestFromPay
} = require('../routes/payment');
const qrGenRoutes = require('../routes/qr_gen')
const adminRoutes = require('../routes/admin')


let port = process.env.PORT || 3000;
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  //ALL CODE GOES IN HERE
  const app = express();

  // genAPIToken = ()=>{
  //   return jwt.sign({
  //     id: process.env.id,
  //     secret: process.env.secret
  //   },config.get("jwtPrivateKey"))
  // }
  // console.log(genAPIToken())

  //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNkY3NkY2Rzdjc4N3Y4c3Y3OHNkczQ1c2Q0ZHNjc2RjIiwic2VjcmV0IjoiZGNzY2FzYXNxd2UyM1VVVUlKSEhoNzc1U0NTRDVDIiwiaWF0IjoxNTQzOTYyODc3fQ.jPQ4-SUZR4AdMs3mbn80cobg5T0vtlASwAz0eQ-PzjI

  /*
    app.use(function(req,res,next){
      try{
      var client_id = 'sdcsdcdsv787v8sv78sds45sd4dscsdc'
      var client_secret = 'dcscasasqwe23UUUIJHHh775SCSD5C'
      var decoded = ()=>{ return jwt.verify(req.header('x-api-token'),config.get('jwtPrivateKey'))}
      if(client_id == decoded().id && client_secret == decoded().secret)
      next();
      else
      return res.status(401).send({success: false,message: "Unauthorized"})
      }
      catch(e){
        return res.status(401).send({success: false,message: "Unauthorized"})
      }
    })
  */
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  app.use(bodyParser.json());
  app.use(
    session({
      name: 'SESS_ID',
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, //will make this true when we get ssl
        httpOnly: true,
        signed: true,
        maxAge: 3600000
      }
    })
  );
  app.use(cookieParser('6xH$*CYY*u44gcUN57%H'))
  //   app.use(csrf());
  //   app.use(function (req, res, next) {
  //     res.cookie('XSRF-TOKEN', req.csrfToken(),{signed: true});
  //     next();
  // });
  app.use(cors())
  app.use(hpp());
  app.disable('x-powered-by');
  app.use(function (req, res, next) {
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Frame-Options', 'deny');
    res.header('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(helmet())
  app.use(helmet.hidePoweredBy({
    setTo: 'KIIT Ecell Server 1.0'
  })); //change value of X-Powered-By header to given value
  app.use(helmet.noCache({
    noEtag: true
  })); //set Cache-Control header
  app.use(helmet.noSniff()); // set X-Content-Type-Options header
  app.use(helmet.frameguard()); // set X-Frame-Options header
  app.use(helmet.xssFilter()); // set X-XSS-Protection header
  app.use(compression())
  app.use(contentLength.validateMax({
    max: MAX_CONTENT_LENGTH_ACCEPTED,
    status: 400,
    message: "Limit Reached"
  }));

  app.use("/api", commonRoutes);
  app.use("/api", authRoutes);
  app.use("/api", profileRoutes);
  app.use("/api", dashboardRoutes);
  app.use("/api", forgotRoutes);
  app.use("/api", paymentRoutes);
  app.use("/api", qrGenRoutes);
  app.use("/api/admin", adminRoutes);






  app.get("*", (req, res) => {
    return res.status(404).send({
      error: "The page was not found"
    });
  })



  app.listen(port, process.env.IP)

  // console.log(`Worker ${process.pid} started`);
}