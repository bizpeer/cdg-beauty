const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Octokit } = require('@octokit/rest');
const nodemailer = require('nodemailer');

dotenv.config();

// 1. Supabase Initialization
const supabaseUrl = process.env.SUPABASE_URL || 'https://agnztfqynbdvqdpxzajh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin access
const supabase = createClient(supabaseUrl, supabaseKey);

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

// 3. Pre-seed Main Admin (Supabase)
async function seedMainAdmin() {
    const mainEmail = process.env.ADMIN_EMAIL || 'top@kwavem.com';

    const { data: existingAdmin, error: fetchError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', mainEmail)
        .single();

    if (!existingAdmin && !fetchError) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS || '!tdon8898', 10);
        const { error: insertError } = await supabase
            .from('admins')
            .insert([
                {
                    email: mainEmail,
                    password_hash: hashedPassword,
                    role: 'main',
                    receives_inquiries: false
                }
            ]);

        if (insertError) console.error('Error seeding main admin:', insertError);
        else console.log('Main admin seeded in Supabase.');
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
        const { data: adminData, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !adminData) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, adminData.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: email, email: adminData.email, role: adminData.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: adminData.role, email: adminData.email });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 2. Sub-Admin Management
app.get('/api/admins', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    try {
        const { data: admins, error } = await supabase
            .from('admins')
            .select('id, email, role, receives_inquiries, created_at')
            .eq('role', 'sub');

        if (error) throw error;
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
        const { error } = await supabase
            .from('admins')
            .insert([{ email, password_hash: hashedPassword, role: 'sub' }]);

        if (error) return res.status(400).json({ message: 'Admin already exists or error occurred' });
        res.json({ message: 'Sub-admin created' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating admin' });
    }
});

app.delete('/api/admins/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'main') return res.status(403).json({ message: 'Permission denied' });
    try {
        const { error } = await supabase
            .from('admins')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
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

// 4. Inquiry Storage
app.post('/api/inquiry', async (req, res) => {
    const { name, email, country, message } = req.body;
    try {
        const { data, error } = await supabase
            .from('inquiries')
            .insert([{ name, email, country, message }])
            .select();

        if (error) throw error;
        res.json({ message: 'Inquiry saved to Supabase', id: data[0].id });
    } catch (err) {
        res.status(500).json({ message: 'Error saving inquiry' });
    }
});

// 5. Inquiry View for Admins
app.get('/api/inquiries', authenticate, async (req, res) => {
    try {
        const { data: inquiries, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching inquiries' });
    }
});

// 6. Product Management
app.get('/api/products', async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('category', { ascending: false });

        if (error) throw error;
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

app.put('/api/products/:id', authenticate, async (req, res) => {
    const { name, tagline, img, color_code } = req.body;
    try {
        const { error } = await supabase
            .from('products')
            .update({ name, tagline, img, color_code })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Supabase Backend running on port ${PORT}`));
