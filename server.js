const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const user = require("./models/usermodel");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require("express-session");

const app = express();

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cf', maxCount: 1 },
    { name: 'cb', maxCount: 1 },
    { name: 'idcf', maxCount: 1 },
    { name: 'idcb', maxCount: 1 }
]);

// Session setup
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
}));

// Middleware setup
mongoose.set('strictQuery', false);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/central-library-uos")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });

app.set("view engine", "ejs");

// Routes
app.get("/central-library-uos/signup", (req, res) => {
    res.sendFile(__dirname + "/public/membership-form.html");
});

app.get("/central-library-uos/login", (req, res) => {
    res.sendFile(__dirname + "/public/Login-page.html");
});





app.post("/central-library-uos/signup", async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error("Error during file upload:", err.message);
            return res.status(400).send("Error during file upload: " + err.message);
        }

        console.log("Request Body:", req.body);
        console.log("Uploaded Files:", req.files);

        const { name, email, password, department, discipline, nic, cpassword } = req.body;

        // Validate all fields
        if (!name || !email || !password || !department || !discipline || !nic || !cpassword) {
            return res.status(400).send("All fields are required");
        }

        // Check if passwords match
        if (password !== cpassword) {
            return res.status(400).send("Passwords do not match");
        }

        try {
            const existingUser = await user.findOne({ email });
            if (existingUser) {
                return res.status(409).send("User with this email already exists");
            }

            const newUser = new user({
                name,
                email,
                password,
                department,
                discipline,
                nic,
                photo: req.files['photo'] ? "uploads/" + req.files['photo'][0].filename : "",
                cf: req.files['cf'] ? "uploads/" + req.files['cf'][0].filename : "",
                cb: req.files['cb'] ? "uploads/" + req.files['cb'][0].filename : "",
                idcf: req.files['idcf'] ? "uploads/" + req.files['idcf'][0].filename : "",
                idcb: req.files['idcb'] ? "uploads/" + req.files['idcb'][0].filename : ""
            });

            await newUser.save();
            req.session.user = newUser;
            res.redirect("/central-library-uos/homepage");
        } catch (error) {
            console.error("Error during signup:", error);
            res.status(500).send("Error during signup, please try again");
        }
    });
});











app.post("/central-library-uos/login", async (req, res) => {
  const { email, password } = req.body;
  try {
      const person = await user.findOne({ email, password });
      if (person) {
          req.session.user = person;  // Store user in session
          res.redirect("/centarl-library-uos/homepage");
      } else {
          res.status(401).send("Invalid credentials");
      }
  } catch (error) {
      res.status(500).send("Error while login, please try again");
  }
});


app.get("/central-library-uos/homepage", (req, res) => {
    if (req.session.user) {  
        const user = req.session.user;  
        res.render("homepage", { user: user }); 
    } else {
        res.redirect("/central-library-uos/login"); 
}});


app.listen(3000, () => {
    console.log("Server is running on port 3000");
}).on('error', (err) => {
    console.log('Error starting the server:', err);
});
