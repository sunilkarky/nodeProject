const express=require("express")
const { blogs, users } = require("./model/index")
//this is for importing hashing npm install bcryptjs and importing so we can use it
const bcrypt=require("bcryptjs") //now you can hash your password



const app=express()
//dbconnection
require("./model/index")


app.set('view engine','ejs')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get("/",async(req,res)=>{
    const allblogs=await blogs.findAll()//blogs vne table ko sab data find garera dinxa//yati garda json ma return grxa database records
    console.log(allblogs)               // next we need to pass it to blogs.ejs file
    res.render("blogs",{blogs:allblogs}) //blogs j lekhda vo allblogs ma chai dat astore xa tye lekhnu
})

app.get("/creatBlog",(req,res)=>{
    res.render("creatBlog")
})


//api banako for form submit
//crreatblog post
app.post("/creatBlog",async (req,res)=>{
    //firs process to insert data from form to database
        //this is fisr step to convet jason format file to const
    const title=req.body.title
    const subtitle=req.body.subtitle
    const description=req.body.description
    console.log(title,subtitle,description) 
            //this is to insert into database using sequlite easy feature .create instead of sql insert query
    await blogs.create({  //index.js ma db.blogs xa so j xa tye use

        title:title,  //column :mathiko const ko name
        subTitle:subtitle,
        description:description


    })


    res.redirect('/')  //yo chai parse grnu prxa natra data lidaina  for comment of blog.ejs /*this is displayed in our browser so<%- use*
                            
})

app.get("/single/:id",async(req,res)=>{   //this is params fro url ma dekhaune /single/id wala ko
    console.log(req.params.id)
    const id=req.params.id
    const blog =await blogs.findAll({
            where:{
                id:id  //our id and database name of id match hune sab display
            }
    })
    console.log(blog)
    res.render("singleBlogs",{blog:blog}) //name any and second yHko DEFINE vko var      
})

//delete page of id
app.get("/delete/:id",async(req,res)=>{
    // res.send("from delete page")
    console.log(req.params.id)
    const id=req.params.id
    const deleteblog=await blogs.destroy ({  //aaru creat single jasto yasma chai var pass grnu  prdaina so const delete blog define nagari direct awaitblogs.destry garda hunxa
        where:{
            id:id    //table id and hamro req.params bata aako id
        }
    })       //blogs table.destroy for delete
    res.redirect("/")
})





//edit blogs yo chai view garauney api hoo post garney xuttai h8nnxa
app.get("/edit/:id",async(req,res)=>{
    console.log(req.params.id)
    const id=req.params.id
    //find blogs of that id and prefill before uodating iso we do this and pass to our ejs file
   const blog=await blogs.findAll({
    where:{
        id:id
    }
   })
    res.render("editBlog",{blog:blog}) //aba yo chai form ko inputtag ko value vanne ma halnu parxa tya j hunx atye variyera aauxa so 

})

// yp chai post garney api cretae garnu par

app.post("/editBlog/:id",async(req,res)=>{   //editblog ko form action ma jun j api hit gareko nam xa tye

    console.log(req.body)
    const id=req.params.id
const title=req.body.title
const description=req.body.description   //console ma aako name
const subtitle=req.body.subtitle

await blogs.update({
    title: title,
    subTitle: subtitle,
    description: description
},{
    where:{
        id:id
    }
})


    res.redirect("/")


})
// app.get("/portfolio",(req,res)=>{
    
//     // res.send("portfolio")
//     res.render("index.ejs")


// })
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
    console.log(req.body)
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
            res.send("login Successfull")
        }
            else{
                res.send("invalid Password")
            }
        }




    })

app.listen(3000,()=>{
    console.log("The node project started at port 3000")
})