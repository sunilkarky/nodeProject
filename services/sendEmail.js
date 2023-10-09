// yo cahi reuse garna banako 
const nodemailer = require("nodemailer");


// var options ={
//     email : "asdf",
//     subject : "",
//     otp : ""
// }
// options.email 

const sendEmail = async (options) => {
  var transporter = nodemailer.createTransport({ //convention transporter var mai rakhne xa
    // service: "gmail",  //k ma pathuna aateko tyo
    host:"smtp.gmail.com",
    port:465,

    auth: {  //sender ko email ra paass
      user:process.env.EMAIL, //"sunilkarki670@gmail.com",  //USER PASS NAI DINU PARO
      pass:process.env.EMAIL_PASSWORD, //"itfzrtqzhzslbtmr", //apppassword from google after 2 factor authenticaiton
    },
  });

  const mailOptions = { //receiver
    from: "Sunil karki <sunilakrki670@gmail.com> ", //key yahi hununparo from to haru
    to: options.email,
    subject: options.subject,
    text: "Your otp is  " + options.otp,
  };

  await transporter.sendMail(mailOptions);  //mathiko configure ko emil patha vanekop'
};

module.exports = sendEmail;