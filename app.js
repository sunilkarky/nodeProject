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


//is authenticated ma hhune erequire garne
const { JsonWebTokenError, decode } = require("jsonwebtoken")

// const promisify=require("util").promisify//cookie sction ma error haldle garna 
// const {promisify}=require("util")   
const { creatBlog, renderSingleBlog, renderCreatBlog, renderallBlog, renderDeleteBlog, renderEditBlog, editBlog, rendermyBlogs, renderLogout} = require("./controller/blog/blogController")

const app=express()
require('dotenv').config() //for encrytping ifle
//dbconnection
require("./model/index")
require("./middleware/isAuthenticated")



app.set('view engine','ejs')

app.use(express.static("uploads/"))   //yo chai fileherna de vaneko

app.use(cookieParser())   //yo chau be careful

app.use(express.json())
app.use(express.urlencoded({extended:true}))


//yo chai thikka cookie-parser ko tala

//aba chai login vako lai matra addblog dekhaune haru grna yo grnu prxa i.e check ogin xaki xaina
    //middleware ho yo eakkhalko jun harek [alii trigger garna milxa]
app.use((req,res,next)=>{  //yo chai harek pali trigger hunxa app.js ma lekheko kura
    // console.log("hello hi ma pheri aaye")             // yo pani eauta middlewaare ho jun harek pali j garda ni trigger hunxa
    res.locals.currentUser=req.cookies.token //yo chai global variable can be used at any place you want i.e currentUser jani acces garna pauxu ma aba
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


    res.render("login")
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
            
            
            res.send("login Successfull")


        }
            else{
                res.send("invalid Password")
            }
        }
    })

app.get("/logout",renderLogout)


app.listen(3000,()=>{
    console.log("The node project started at port 3000")
})