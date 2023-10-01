const { blogs, users } = require("../../model")




exports.renderallBlog=async(req,res)=>{
    // yochai join garnu vanda pilako code ->const allblogs = await blogs.findAll()//blogs vne table ko sab data find garera dinxa//yati garda json ma return grxa database records
    
    //yo chai findAll vitra kunai table "join" garda ysari garne yesle cahi aarko table ni access dinxa so it can be used accto syntax blog.user.username
    const allblogs = await blogs.findAll({
        include:{
            model:users   //model nai hunxa aarko chai tablename aba chai allblogs ma users table i jodera janxa and we can access it through blog.user.username
        }
    })
    // console.log(allblogs)               // next we need to pass it to blogs.ejs file
    res.render("blogs",{blogs:allblogs}) //blogs j lekhda vo allblogs ma chai dat astore xa tye lekhnu also after join we can acces next table using blog.user.username in ejs file
}

exports.renderCreatBlog=(req,res)=>{
    res.render("creatBlog")
}

exports.creatBlog=async (req,res)=>{
    //for image handling
    console.log(req.file) //file type ko chai req.file ma aauxa not body
    const fileName=req.file.filename   


    // console.log(req.user[0].id,"userID from middleware isauthenticated")//aba tanera matra hain table ma user id vanne column ma halnu ni paro nita ie link thyo ni tyo
    const userId=req.user[0].id //token bata aako id authenticate garera ab tyo id hamro table ko user id ma halneyy by creating 

    //firs process to insert data from form to database
        //this is fisr step to convet jason format file to const
    const title=req.body.title
    const subtitle=req.body.subtitle
    const description=req.body.description
    // console.log(title,subtitle,description) 
    if(!title||!subtitle||!description||!req.file){  //server validation
        return res.send("please fill aall the fields above")
    }
            //this is to insert into database using sequlite easy feature .create instead of sql insert query
    await blogs.create({  //index.js ma db.blogs xa so j xa tye use

        title:title,  //column :mathiko const ko name
        subTitle:subtitle,
        description:description,
        //after authenticated vara aara middleware ppass garera aako ani mathi define grerra assign gareko xa yo
        userId:userId   , //userID:req.userId from repo
                           //image:fileName     //image cahi nabasne vara hamile ysari view garna sakinxa image:"http://localhost:4000/"+fileName
        image:process.env.IMAGE_URL + fileName      // http jodera direct database ma link save garna lai gareeko by adding   
    })


    res.redirect('/')  //yo chai parse grnu prxa natra data lidaina  for comment of blog.ejs /*this is displayed in our browser so<%- use*
                            
}
exports.renderSingleBlog=async(req,res)=>{   //this is params fro url ma dekhaune /single/id wala ko
    console.log(req.params.id)
    const id=req.params.id
    const blog =await blogs.findAll({
            where:{
                id:id  //our id and database name of id match hune sab display
            },include:{
                model:users   //single blog mani author haru dekhauna milo user table access
            }
    })
    console.log(blog)
    res.render("singleBlogs",{blog:blog}) //name any and second yHko DEFINE vko var      
}


exports.renderDeleteBlog=async(req,res)=>{
    // res.send("from delete page")
    console.log(req.params.id)
    const id=req.params.id
    const deleteblog=await blogs.destroy ({  //aaru creat single jasto yasma chai var pass grnu  prdaina so const delete blog define nagari direct awaitblogs.destry garda hunxa
        where:{
            id:id    //table id and hamro req.params bata aako id
        }
    })       //blogs table.destroy for delete
    res.redirect("/")
}


exports.renderEditBlog=async(req,res)=>{
    console.log(req.params.id)
    const id=req.params.id
    //find blogs of that id and prefill before uodating iso we do this and pass to our ejs file
   const blog=await blogs.findAll({
    where:{
        id:id
    }
   })
    res.render("editBlog",{blog:blog}) //aba yo chai form ko inputtag ko value vanne ma halnu parxa tya j hunx atye variyera aauxa so 

}


exports.editBlog=async(req,res)=>{   //editblog ko form action ma jun j api hit gareko nam xa tye

    const fileName=req.file.filename


    // console.log(req.body)
    // console.log(req.file)
    const id=req.params.id
const title=req.body.title
const description=req.body.description   //console ma aako name
const subtitle=req.body.subtitle
if(!title||!subtitle||!description||!req.file){  //server validation
        return res.send("please fill aall the fields above")
    }

await blogs.update({
    title: title,
    subTitle: subtitle,
    description: description,
    image:process.env.IMAGE_URL + fileName    // image: process.env.IMAGE_URL+fileName
},{
    where:{
        id:id
    }
})


    res.redirect("/")


}
exports.rendermyBlogs=async(req,res)=>{

    const userId=req.userId ///yo chai  middlewere bata liyako ho maile req ani check gareko jun hamro user id sanga match xa
    //find blogs of this ueser id tbaove
    const myBlogs=await blogs.findAll({  //blogs vanne table bata find all
        where:{
            userId:userId //column aarko hamro mathi aako token ko id vanne logic ani tyo uta pass garney ani dekhauney
        }
    })
    res.render("myBlogs",{myBlogs:myBlogs})  
}

// exports.logOut