const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Octokit } = require('@octokit/rest');
const nodemailer = require('nodemailer');

dotenv.config();

// 1. Google Cloud Firestore Initialization
// In a real scenario, place your serviceAccountKey.json in the backend folder
let db;
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (e) {
    // Fallback for environment variables if key file is not present
    console.log('Service account key file not found, trying environment initialization...');
    if (process.env.GCLOUD_PROJECT_ID) {
        admin.initializeApp({
            projectId: process.env.GCLOUD_PROJECT_ID
        });
    } else {
        console.error('Google Cloud Project ID is missing in .env');
    }
}
db = admin.firestore();

// 2. Utils & Globals
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

// 3. Pre-seed Main Admin (Firestore)
async function seedMainAdmin() {
    const mainEmail = process.env.ADMIN_EMAIL || 'top@kwavem.com';
    const adminRef = db.collection('admins').doc(mainEmail);
    const doc = await adminRef.get();

    if (!doc.exists) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS || '!tdon8898', 10);
        await adminRef.set({
            email: mainEmail,
            password: hashedPassword,
            role: 'main',
            receivesInquiries: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('Main admin seeded in Firestore.');
    }
}
seedMainAdmin().catch(console.error);

// 4. Middleware: Authenticate JWT
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
    try {
        const adminDoc = await db.collection('admins').doc(email).get();
        if (!adminDoc.exists) return res.status(400).json({ message: 'Invalid credentials' });

        const adminData = adminDoc.data();
        const isMatch = await bcrypt.compare(password, adminData.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: email, email: adminData.email, role: adminData.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: adminData.role, email: adminData.email });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 2. Sub-Admin Management (Firestore)
app.get('/api/admins', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    try {
        const snapshot = await db.collection('admins').where('role', '==', 'sub').get();
        const admins = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            delete data.password;
            admins.push({ id: doc.id, ...data });
        });
        res.json(admins);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching admins' });
    }
});

app.post('/api/admins', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const adminRef = db.collection('admins').doc(email);
        const doc = await adminRef.get();
        if (doc.exists) return res.status(400).json({ message: 'Admin already exists' });

        await adminRef.set({
            email,
            password: hashedPassword,
            role: 'sub',
            receivesInquiries: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ message: 'Sub-admin created' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating admin' });
    }
});

app.delete('/api/admins/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    try {
        await db.collection('admins').doc(req.params.id).delete();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting admin' });
    }
});

// 3. Asset Management (GitHub API) - Remains same logic
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
    const { path, content, sha, message } = req.body;
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

// 4. Inquiry Storage (Firestore)
app.post('/api/inquiry', async (req, res) => {
    const { name, email, country, message } = req.body;
    try {
        const inquiryRef = await db.collection('inquiries').add({
            name,
            email,
            country,
            message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // Optional: Email notification logic can be reactivated here
        res.json({ message: 'Inquiry saved to Google Cloud', id: inquiryRef.id });
    } catch (err) {
        res.status(500).json({ message: 'Error saving inquiry' });
    }
});

// 5. Inquiry View for Admins
app.get('/api/inquiries', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('inquiries').orderBy('timestamp', 'desc').get();
        const inquiries = [];
        snapshot.forEach(doc => {
            inquiries.push({ id: doc.id, ...doc.data() });
        });
        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching inquiries' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Google Cloud Backend running on port ${PORT}`));
