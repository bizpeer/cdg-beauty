const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Octokit } = require('@octokit/rest');
const nodemailer = require('nodemailer');

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (Fallback to local if fail)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cdg_beauty';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('Running in "Memory Mode" for demo purposes.');
    });

// Admin Schema
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['main', 'sub'], default: 'sub' },
    receivesInquiries: { type: Boolean, default: false }
});

const Admin = mongoose.model('Admin', adminSchema);

// Pre-seed Main Admin
async function seedMainAdmin() {
    const mainEmail = process.env.ADMIN_EMAIL || 'top@kwavem.com';
    const existing = await Admin.findOne({ email: mainEmail });
    if (!existing) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS || '!tdon8898', 10);
        await Admin.create({
            email: mainEmail,
            password: hashedPassword,
            role: 'main'
        });
        console.log('Main admin seeded.');
    }
}
seedMainAdmin();

// Middleware: Authenticate JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = decoded;
        next();
    });
};

// --- Routes ---

// 1. Auth: Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: admin.role, email: admin.email });
});

// 2. Sub-Admin Management (Main Admin Only)
app.get('/api/admins', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    const admins = await Admin.find({ role: 'sub' }).select('-password');
    res.json(admins);
});

app.post('/api/admins', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newAdmin = await Admin.create({ email, password: hashedPassword, role: 'sub' });
        res.json(newAdmin);
    } catch (err) {
        res.status(400).json({ message: 'Admin already exists' });
    }
});

app.delete('/api/admins/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// 3. Email Config: Set receiving admin
app.post('/api/config/inquiry-receiver', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    const { email } = req.body;
    await Admin.updateMany({}, { receivesInquiries: false });
    await Admin.updateOne({ email }, { receivesInquiries: true });
    res.json({ message: 'Inquiry receiver updated' });
});

// 4. Asset Management (GitHub API)
app.get('/api/assets', authenticate, async (req, res) => {
    try {
        const list = await octokit.repos.getContent({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: 'public/assets/images'
        });
        res.json(list.data.filter(file => file.type === 'file'));
    } catch (err) {
        res.status(500).json({ message: 'Error fetching assets' });
    }
});

app.post('/api/assets/replace', authenticate, async (req, res) => {
    const { path, content, sha, message } = req.body; // content is base64
    try {
        await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path,
            message: message || 'Update asset via Admin Panel',
            content,
            sha
        });
        res.json({ message: 'Asset updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating asset' });
    }
});

// 5. Inquiry Email
app.post('/api/inquiry', async (req, res) => {
    const { name, email, country, message } = req.body;
    const receiver = await Admin.findOne({ receivesInquiries: true }) || await Admin.findOne({ role: 'main' });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: receiver.email,
        subject: `[CDG Beauty] New Business Inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nCountry: ${country}\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Inquiry sent' });
    } catch (err) {
        res.status(500).json({ message: 'Error sending inquiry' });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
