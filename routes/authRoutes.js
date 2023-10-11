const { registerUser, renderRegisterUser, renderLogin, login, renderForgotPassword, forgotPassword, renderOtp, otp, renderPasswordChange, handlePasswordChange } = require("../controller/auth/authController")

//yo chai harek thauma garnu parxa in routing 
const router=require("express").Router()  //express le dinxa so require gareko
                                            // module.exports=router   yoni tala garnu parxa in every so math for note ko lagi

//app,get("/register",registerUser) ko sato
//app.post("/register")   duitai ko sato chai garna sakinxa

router.route("/register").get(renderRegisterUser).post(registerUser)  //aba uta app ma call garnu ni paro

router.route("/login").get(renderLogin).post(login)

router.route("/forgotPassword").get(renderForgotPassword).post(forgotPassword)

router.route("/otp").get(renderOtp)

router.route("/otp/:id").post(otp)

router.route("/passwordChange").get(renderPasswordChange)

router.route("/handlePasswordChange/:email/:otp").post(handlePasswordChange)




module.exports=router