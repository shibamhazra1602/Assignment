const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://Shibam849:s123456@cluster0.tveqczp.mongodb.net/creativeShowcaseDB?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Database connected.."))
    .catch(err => console.log("Connection failed: ", err));

// Models
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const ImageSchema = new mongoose.Schema({
    imageUrl: String,
    username: String,
    title: String,
    uploadDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Image = mongoose.model('Image', ImageSchema);

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing fields" });
        }
        
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "Registered" });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "User already exists" });
        }
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (user) {
        res.json({ message: "Login success", username: user.username });
    } else {
        res.status(400).json({ error: "Wrong details" });
    }
});

app.get('/api/images', async (req, res) => {
    const data = await Image.find();
    res.json(data);
});

app.get('/api/images/:user', async (req, res) => {
    const data = await Image.find({ username: req.params.user });
    res.json(data);
});

app.post('/api/upload', async (req, res) => {
    const img = new Image(req.body);
    await img.save();
    res.status(201).send("Done");
});

app.delete('/api/images/:id', async (req, res) => {
    try {
        await Image.findByIdAndDelete(req.params.id);
        res.status(200).send("Deleted");
    } catch (err) {
        res.status(500).json({ error: "Could not delete" });
    }
});



app.listen(PORT, () => console.log(`Server running on ${PORT}`));