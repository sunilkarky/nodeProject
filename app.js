const express=require("express")
const { blogs, users } = require("./model/index")
//this is for importing hashing npm install bcryptjs and importing so we can use it
const bcrypt=require("bcryptjs") //now you can hash your password

require("./controller/blog/blogController")

//for middleware
const {isAuthenticated}=require("./middleware/isAuthenticated");


//for image handling this is done
const { multer, storage } = require("./middleware/multerConfig"); //../ route bahira aara middleware vitra /multerConfig ma
const upload = multer({ storage: storage }); //jun uta multerConfig ma export garreko thyo multer ra storage tyo yha liyako

const jwt=require("jsonwebtoken") //npm installjsonwebtoken garera import gareko for use after login successfull
const { configDotenv } = require("dotenv")
const cookieParser = require("cookie-parser")  //for getting cookie from browser req.cookie.token direct bujdaina so

//for flashing error in same page using npm install express-session connect-flash

const session=require("express-session") //login garda invalid password success vanera same page ma display garauna we use this instead of cookie or res.locals i.e connect-flash
const flash=require("connect-flash")  //yo require gariyo aba use gar vannu paro 



//is authenticated ma hhune erequire garne
const { JsonWebTokenError, decode } = require("jsonwebtoken")

// const promisify=require("util").promisify//cookie sction ma error haldle garna 
// const {promisify}=require("util")   
const { creatBlog, renderSingleBlog, renderCreatBlog, renderallBlog, renderDeleteBlog, renderEditBlog, editBlog, rendermyBlogs, renderLogout} = require("./controller/blog/blogController");
const { render } = require("ejs");
const sendEmail = require("./services/sendEmail");
const { decodeToken } = require("./services/decodeToken");

const app=express()
require('dotenv').config() //for encrytping ifle
//dbconnection
require("./model/index")
require("./middleware/isAuthenticated")



//use flash eror display
app.use(session({  //session({le object linxa in key value}) app.use(session({}))
    secret:"hellowworld", //sign garira hunxum yo secretle sessionlai 
    resave:false, // efault true hunxa false parda purano ata sessio ma xa vane naya change vayo vne matra linxa natra sam xa vane pailakai rakxa
    saveUninitialized:  false //data rerad track garney false garda chai 2 tai ma storage kam hunxa ra chainaina
}))

app.use(flash())  //npm install connect-flash fro ispaly error



app.set('view engine','ejs')

app.use(express.static("uploads/"))   //yo chai fileherna de vaneko

app.use(cookieParser())   //yo chau be careful

app.use(express.json())
app.use(express.urlencoded({extended:true}))


//yo chai thikka cookie-parser ko tala

//aba chai login vako lai matra addblog dekhaune haru grna yo grnu prxa i.e check ogin xaki xaina
    //middleware ho yo eakkhalko jun harek [alii trigger garna milxa]
app.use(async(req,res,next)=>{  //yo chai harek pali trigger hunxa app.js ma lekheko kura
    // console.log("hello hi ma pheri aaye")             // yo pani eauta middlewaare ho jun harek pali j garda ni trigger hunxa
    res.locals.currentUser=req.cookies.token //yo chai global variable can be used at any place you want i.e currentUser jani acces garna pauxu ma aba
    
    //yo chai aba jasle blog banako uslai matra edit delete button dekhaune tyo aaru login xa vaneni login vara aajai id ni check grnu pro ani usko ho vane matra dekhauney edit delete haru
    
    const token=req.cookies.token //token launey call garera
    if(token){   //token xa vane tslai decrypted garney with help of function declared at services decodeToken ma
        const decryptedResult=await decodeToken(token,process.env.SECRETKEY) //yo output chai id expiry ahru hunxa ni tye
        if(decryptedResult && decryptedResult.id){     //output aayo ra output vitra id ni aayo vane matra garneyaccess dine
            res.locals.currentUserId=decryptedResult.id
        }
    }
    next()    //next ma janxa mathika vara                               //

})





app.get("/",renderallBlog)

app.get("/creatBlog",isAuthenticated,renderCreatBlog)


//api banako for form submit
//crreatblog post
app.post("/creatBlog",isAuthenticated,upload.single('image'),creatBlog)   //.singl rfor single image .array for multipeb also uta form ma name="" j xa tye

app.get("/single/:id",renderSingleBlog)

//delete page of id
app.get("/delete/:id",isAuthenticated,renderDeleteBlog)





//edit blogs yo chai view garauney api hoo post garney xuttai h8nnxa
app.get("/edit/:id",isAuthenticated,renderEditBlog)

// yp chai post garney api cretae garnu par

app.post("/editBlog/:id",isAuthenticated,upload.single('image'),editBlog)


app.get("/myBlogs",isAuthenticated,rendermyBlogs)

app.get("/register",(req,res)=>{
    res.render("register")
})
app.post("/register",async(req,res)=>{
    

    console.log(req.body)
    const {username,password,email,confirmPassword}=req.body

    //insert hunu vanda agadi check garnu paro ki pass and confirm pass match or not
    // if(password.toLowerCase()!==confirmPassword.toLowerCase()){ //yo halda chai alik aramro hunxa
    //     return res.send("Password and confirm password doesnot match")
    // }
    if(password!==confirmPassword){ 
            return res.send("Password and confirm password doesnot match")

    }


    //insert into table of database
    await users.create({

        email:email,
        username:username,
        password:bcrypt.hashSync(password,8)

    })
    res.redirect("/login")
})


//to login form get k garney after login
app.get("/login",(req,res)=>{

    const error=req.flash("error")   //yo chai tala bata invalid password huda k agrney vanera login post api bata aako lai var ma store greko ani ejs ma display grna pass gareko

    res.render("login",{error:error})
})
app.post("/login",async(req,res)=>{
    // console.log(req.body)
    // res.send("Successfull login")
    const {email,password}=req.body //form ko nme r yo email pas ko name sam ehunu paro
      //server side validation pani garxuparxa for moree security even if client side veerification

      if(!email||!password){
        return res.send("Email and Password are required")
      }

      //first check ifemail exist or not in our tableof registered user
      const userEmailExist=await users.findAll({
        where:{
            email:email //yesle chai array ma yo email sanga associated data name password like databaseko sab row dinxa

        }
      })
      //if email doesnot exist yasle empty dinxa so validate that

      if(userEmailExist.length==0){
        res.send("user with that email doesnot exist")
      }else{
        // email vayo vane matra yo block ma aauxa aba password ni check garnu paro
        const passwordVerified=userEmailExist[0].password
        const isMatched =bcrypt.compareSync(password,passwordVerified) //true ofr false return
        
        //check if matched or not
        if(isMatched){  
            // console.log(process.env.SECRETKEY) //token always login vayesi matra soo
            // const token=jwt.sign({name:"manish"},process.env.SECRETKEY,{expiresIn:"30d"}) //set gareko hamr token
            // token banauna yo sign vanne methon jsonwt lw deko hunxa
            const token=jwt.sign({id:userEmailExist[0].id},process.env.SECRETKEY,{expiresIn:"30d"}) 

            //aba yo token cokkie ma save garera rakhney
            res.cookie('token',token,{//browserma application tab vitracokkie vanney ma save garxa
                secure:true, //suruko token chai uta browser ma k nam bata dine ra second is our variable here
                expireIn:"120",  //120 sec
            })
            
            
            // res.send("login Successfull")
            req.flash("success","Logged in Successfully") 
            req.flash("error","login Failed")//yo chai rakheko session ma anisuccess key ma message
            res.redirect("/")  //redirect / ma vako xa tyosma blogs render vako xa tya gara yo access garney eauta var ma req.flash("success") garney ani uta ejs ma pass garney



        }
            else{
                // res.send("invalid Password")
                // to flsh messages we have configure in app,js use ma 
                req.flash("error","Invalid Password")   //we must do display in ejs file b//error key aarko value tyo error key j rakho tsmai baseko hunxa
                res.redirect("/login")    //flash garesi redirect compulsary garnu paro
            }
        }
    })

app.get("/logout",renderLogout)

app.get("/renderForgotPassword",(req,res)=>{
    res.render("forgotPassword")

})
app.post("/forgotPassword",async(req,res)=>{
    const email=req.body.email
    const generatedOtp=Math.floor(10000 * Math.random(9999))
    console.log(generatedOtp)
    // console.log(email)
    //email hlnu parxa validation
    if(!email){
        return res.send("please provide email")
    }
    // aba chai check garnu paro ki tyo email xa ki xain in our table of users
    const emailExists=await users.findAll({
        where:{
            email:email
        }
    })
    if(emailExists.length==0){
        return res.send("User with that email doesnot exist")
    }else{  //if user exist with that emaail then send otp
        await sendEmail({   //2 ta argument xa ypo function ko uta  services ko send mail options le chai object linxa
            email:email,  // to: options.email, suruko uta j namko xa key tye linu paro  secon mathiko var
            subject: "Forgot password OTP",
            otp:generatedOtp
        })
        //aba tyo mathiko otp vanne var ko otp raahileko time database ma ni halnu paro so we do this an save
        emailExists[0].otp=generatedOtp
        emailExists[0].otpGenerateTime=Date.now()
        await emailExists[0].save()

        //now otp halne page ma jane
        
        res.redirect("/otp?email="+ email) //yo chai query bata eamil ni pathako mathi search bar ma along with otp so we can access taht eamil and search kun email ko yo otp xa vaner for faster search rather than 
                                //res.redirect("/otp")//with otp matra search
        // res.send("Email sent successfully")
    }
})


app.get("/otp",(req,res)=>{
    const email=req.query.email// yo chai mathi browser ma aako query bataaccess gareko
     // console.log(email)
    if(!email){
        return res.send("no email bro")
    }
    res.render("otpForm",{email:email}) //mathiko aako pass gareko so api hit garda action ma use garna
})

app.post("/otp/:id",async(req,res)=>{ //id is email from send otp api redirect jun chai get bata uta passvara ani id ma aara access gareko
    const otp=req.body.otp
    const email=req.params.id
    if(!otp||!email){
        return res.send("please send email or otp")
    }
    //aba find garney tyo email ra otp kunai ko xa ki xaina
    const userData=await users.findAll({
        where:{
        email:email, //email ra otp duitai match then user aauxa natra 0 
        otp:otp
        }
    })
    if(userData.length==0){
        return res.send("invalid otp Bro")
    }else{
        // res.send("Valid otp") aajai garnu paro aba time limit samman matra otp valid rakhney
        const currentTime=Date.now() //aaahile ko time
        const otpGenerateTime=userData[0].otpGenerateTime  //user table ma mathi otp generate vako belako time

        //check for 2 min more or not
        if(currentTime-otpGenerateTime <= 120000){
            // res.send("valid OTP")
            //we can also make our otp null after checking condition to make secure
            //userData[0].otp=null
            //userData[0].otpGenerateTime=null //we cantrack last password change by not making it null
            //userData[0].save()                but hacker can bypass it if null rakhium vane by hitting api to go to change password
            
           // res.redirect("/passwordChange") //password change garne page ma lagney
           //for more validation we aso pass email and otp so it can be querie in get api and used in post for more validation
            
           //string lateral use gareko topass multiple email and otp for more validation
            res.redirect(`/passwordChange?email=${email}&otp=${otp}`) //"not" `` this symbol
                                            //  ?email="+ email concatenate ni grera grda hunxa   //this can be accessedd in get api of passwordchange in query

        }else{
            res.send("OTP has expired")
        }
    
    }


})

app.get("/passwordChange",(req,res)=>{
    const email=req.query.email
    const otp=req.query.otp
    
    
    // console.log(email,otp,email,otp)
    if(!email||!otp){
        return res.send("Email and otp should be provided in query")
    }
    res.render("passwordChange",{email,otp})
})

//handle new passeword and confirm password
app.post("/handlePasswordChange/:email/:otp",async(req,res)=>{
    const{newPassword,confirmPassword}=req.body
    // console.log(newPassword)
    const email=req.params.email
    const otp=req.params.otp
    const currentTime=Date.now()
    console.log(currentTime)
    
    // console.log(otp,email)
    if(!newPassword||!confirmPassword||!email||!otp){
        return res.send("Please provide new password and confirm password")
    }

    //checking if that email ko otp hoki haina to make secure yadi browser ma change garera access grxa ki vanera jpt otp bata access nadine 
    const userData=await users.findAll({
        where:{
            email:email,
            otp:otp
        }
    })
    //match new pass nad confirm password
    if(newPassword!=confirmPassword){
        return res.send("Please Match your Password and confirm Password")
    }
    
    if(userData.length==0){
        return res.send("Why you do this bro Donot attack my website")
    }
    const otpGeneratedTime=userData[0].otpGenerateTime
    console.log(otpGeneratedTime)
    
    //aba chai forget password garna ni otp expiration time rakhney ani garney
    if(currentTime - otpGeneratedTime >=240000){
        // return res.send("password reset time expired try again")
        res.redirect("/renderForgotPassword")  //better ho yo messgae ekhunu vanda
    }


    

    //aba password update garnu paro tyo email ko
    //tara form mata verify otp matra xa aba kasari tha pauney ta kun ko new pass ra confirm pass updatae garney vanera
    //tesaile aba hami query bata  email pathauxau as in mathi email otp wala ko 
    //suruma get api bata uta ejs ma form action ma pathaune ani params bata post ma tanne

    //update passwor by two process 
    //1st process
    // const hashedPassword=bcrypt.hashSync(newPassword,8)
    // const userDatas=await users.findAll({ //yesle chai sab find garxa ani update garxa
    //     where:{email:email}
    // })
    // userDatas[0].password=hashedPassword
    // await userDatas[0].save()

    //2nd process
    const hashedNewPassword=bcrypt.hashSync(newPassword,8)
    await users.update({  //yo chai just like eit blog ma vako
        password:hashedNewPassword   //direct haldinxa yesle chai //users vanne ma jun password xa tsma update garde
    },{
        where:{
            email:email
        }
    })

    res.redirect("/login")
})
    
    
    


app.listen(3000,()=>{
    console.log("The node project started at port 3000")
})