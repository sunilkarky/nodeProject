const { blogs } = require("../../model")

exports.renderCreatBlog=(req,res)=>{
    res.render("creatBlog")
}

exports.creatBlog=async (req,res)=>{

    console.log(req.user[0].id,"userID from middleware isauthenticated")//aba tanera matra hain table ma user id vanne column ma halnu ni paro nita ie link thyo ni tyo
    const userId=req.user[0].id //token bata aako id authenticate garera ab tyo id hamro table ko user id ma halneyy by creating 

    //firs process to insert data from form to database
        //this is fisr step to convet jason format file to const
    const title=req.body.title
    const subtitle=req.body.subtitle
    const description=req.body.description
    // console.log(title,subtitle,description) 
            //this is to insert into database using sequlite easy feature .create instead of sql insert query
    await blogs.create({  //index.js ma db.blogs xa so j xa tye use

        title:title,  //column :mathiko const ko name
        subTitle:subtitle,
        description:description,
        //after authenticated vara aara middleware ppass garera aako ani mathi define grerra assign gareko xa yo
        userId:userId


    })


    res.redirect('/')  //yo chai parse grnu prxa natra data lidaina  for comment of blog.ejs /*this is displayed in our browser so<%- use*
                            
}
exports.renderSingleBlog=async(req,res)=>{   //this is params fro url ma dekhaune /single/id wala ko
    console.log(req.params.id)
    const id=req.params.id
    const blog =await blogs.findAll({
            where:{
                id:id  //our id and database name of id match hune sab display
            }
    })
    console.log(blog)
    res.render("singleBlogs",{blog:blog}) //name any and second yHko DEFINE vko var      
}