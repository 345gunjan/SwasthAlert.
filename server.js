const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve frontend files from "public" folder
app.use(express.static(__dirname + "/public"));

// ✅ Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/LoginDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("MongoDB Error:", err));

// ✅ Schema for user registration/login
const userSchema = new mongoose.Schema({
    fullname: String,
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String,
    phone: String,
    dob: String,
    vaccine: String,
    childVaccine: String
});

// ✅ Force collection name = "users"
const User = mongoose.model("User", userSchema, "users");

// ✅ Home route opens register page
app.get("/", (req, res) => {
    res.sendFile("register.html", { root: __dirname + "/public" });
});

// ================= REGISTER API =================
app.post("/register", async (req, res) => {
    try {
        const exists = await User.findOne({
            $or: [{ email: req.body.email }, { username: req.body.username }]
        });

        if (exists) {
            return res.status(409).json({ message: "User already exists ⚠ Try different email/username" });
        }

        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: "Registration Successful ✅", user });
    } catch (err) {
        res.status(500).json({ message: "Error registering user ❌", error: err });
    }
});

// ================= LOGIN API =================
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required ❗" });
        }

        const user = await User.findOne({ username, password });
        if (user) {
            res.status(200).json({ message: "Login Successful ✅", user });
        } else {
            res.status(401).json({ message: "Invalid Username or Password ❌" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error ❌", error: err });
    }
});

// ================= PROFILE API =================
app.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) res.json(user);
        else res.status(404).json({ message: "User not found ❌" });
    } catch (err) {
        res.status(500).json({ message: "Server error ❌", error: err });
    }
});

// ✅ Start server
app.listen(5000, () => {
    console.log("✅ Server running at: http://localhost:5000 🚀");
});
