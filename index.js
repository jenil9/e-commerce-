const express=require('express');
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const secretkey='jenilbunha';
const crypto = require('crypto');
 const axios = require('axios');
const Product=require('./models/product');
const Cart = require('./models/cart');

// Use a fixed key and IV for demo (store securely in real apps)
const key = crypto.scryptSync('your-secret-password', 'salt', 32); // 32-byte key
const iv = Buffer.alloc(16, 0); // 16-byte IV (initialization vector) — all zeros for simplicity

// Encrypt
function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decrypt
function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const app=express();
const user=require('./models/user');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).send('Access Denied: No Token Provided');

  jwt.verify(token, secretkey, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
}

mongoose.connect('mongodb://127.0.0.1:27017/practice')
.then(()=>{
    console.log("mongodb connected for practice")
})
.catch((err)=>{
    console.log(err);
});

const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
// Optional: Set folder for views if not "views"
app.set('views', './views');
// Serve static files (CSS, images, etc.)
app.use(express.static('public'));
app.use(express.json());
// app.use(cookieParser()); 

app.get('/',(req,res)=>{
    res.render('loginpage');
})

app.get('/api/home', authenticateToken, (req, res) => {
  res.json({ name: req.user.name,lastname:req.user.lastname });
});
app.get('/api/products', async (req, res) => {
  try {
    const data = await Product.find({});
     res.json(data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


app.get('/home', (req, res) => {
  res.render('homepage'); 
});

app.post('/signup',async (req,res)=>{
    // res.send('hello');
     const email=req.body.email;
     const password=req.body.password;
     const name=req.body.name;
     const lastname=req.body.lastname;
       try {
        if (await user.findOne({ email })) {
  return res.status(400).set('Content-Type', 'text/html').send(`user already exists. <br>
          <a href="/">Go to login</a>`);
}

        const encry=encrypt(password);
     await user.create({name,lastname,email, password:encry });
    
        res.set('Content-Type', 'text/html').send(`
          <h2>user created</h2>
          <br>
          <a href="/">Go to login</a>
        `);
      } catch (err) {
          res.set('Content-Type', 'text/html').status(500).send(`
          <h2 style="color:red">Error: Failed to sign up</h2>
          <br>
          <p>${err.message}</p>
          <br>
          <a href="/signuppage">Go back</a>
        `);
          }

})
app.post('/login',async (req,res)=>{
    const email=req.body.email;
     const password=req.body.password;
     
     try{
       const encry=encrypt(password);
   const j=await user.findOne({ email:email, password:encry });
   if (!j) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

   const token = jwt.sign({ email:`${email}`,password:`${password}`,name:`${j.name}`}, secretkey);
       res.json({token});
     }
       catch (err) {
  res.status(500).json({ message: "Server error during login", error: err.message });
}

     
    // res.send('hello');
})

app.get('/signuppage',(req,res)=>{
    res.render('signuppage');
})


app.get('/profile', authenticateToken, (req, res) => {
  const { name, email, password } = req.user;
  res.render('profile', {
    user: {
      name,
      email,
      password,
      lastname: req.user.lastname || '',
      createdAt: new Date(),
      _id: 'Hidden in JWT' // optional placeholder if not in JWT
    }
  });
});


app.get('/cart', (req, res) => {
  res.render('cart'); // Make sure views/cart.ejs exists
});



app.listen(3000,()=>{
    console.log("server connected at 3000");
})
