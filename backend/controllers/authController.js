// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const axios = require('axios');

exports.facebookAuth = async (req, res) => {
  const { accessToken, userID } = req.body;
    console.log("Received Facebook accessToken:", accessToken);
  console.log("Received Facebook userID:", userID);

  if (!accessToken || !userID) {
    return res.status(400).json({ message: 'Missing accessToken or userID' });
  }


  try {
    const fbRes = await axios.get(
      `https://graph.facebook.com/v20.0/${userID}?fields=id,name,email&access_token=${accessToken}`
    );

    const { name } = fbRes.data;
    const email = fbRes.data.email || `${userID}@facebook.com`;
    if (!email) {
  console.error('❌ Email not returned from Facebook API');
  return res.status(400).json({ message: 'Facebook account has no email address or permission was denied.' });
}

    let user = await User.findOne({ email });

    if (!user) {
      const dummyPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);
      user = new User({ username: name, email, password: hashedPassword });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    res
      .cookie('accessToken', jwtToken, {
        httpOnly: true,
        secure: process.env.USE_NGROK === 'true' || process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.USE_NGROK === 'true' || process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        username: user.username,
        email: user.email,
      });
  } catch (error) {
    console.error('Facebook auth error:', error.message);
    res.status(400).json({ message: 'Facebook login failed' });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const dummyPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);
      user = new User({ username: name, email, password: hashedPassword });
      await user.save();
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.USE_NGROK === 'true' || process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.USE_NGROK === 'true' || process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        username: user.username,
        email: user.email,
      });

  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 minutes
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;

    console.log("📧 Sending password reset email to:", email);
    console.log("🔗 Reset link:", resetLink);
    console.log("🔐 Using credentials:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? '[HIDDEN]' : '[MISSING]');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Email sending error:', err);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log('✅ Email sent:', info.response);
      res.json({ message: 'Password reset link sent to your email' });
    });
  } catch (err) {
    console.error('❌ Forgot password internal error:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({
    email,
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Password has been reset successfully' });
};


exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Received signup request:', { username, email });

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        console.log('Checking existing user:', existingUser);

        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        console.log('Generated salt:', salt);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Hashed password:', hashedPassword);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        console.log('Creating new user:', newUser);

        await newUser.save();
        console.log('User saved successfully:', newUser._id);

        // Generate JWT token
        console.log('Generating JWT token...');
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables.');
            return res.status(500).json({ message: 'Internal server error' });
        }

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('Generated token:', token);

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    // Store tokens in httpOnly cookies
    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
      secure: process.env.USE_NGROK === 'true' || process.env.NODE_ENV === 'production',
      sameSite: 'None',
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
      secure: process.env.USE_NGROK === 'true' || process.env.NODE_ENV === 'production',
      sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({ success: true, username: user.username, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};


exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(403).json({ message: 'Refresh token required' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
            if (err) {
                console.error('Invalid refresh token:', err);
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30m' });
            res.json({ accessToken });
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.checkAuth = async (req, res) => {
  console.log("🧪 checkAuth endpoint hit");

  // Log incoming cookies for debugging
  console.log("🍪 Incoming Cookies:", req.cookies);

  const token = req.cookies.accessToken;

  if (!token) {
    console.log("❌ No accessToken cookie found.");
    return res.status(401).json({ authenticated: false });
  }

  try {
    console.log("🔐 Verifying JWT token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Token verified. Decoded payload:", decoded);

    const user = await User.findById(decoded.id).select('username email');
    if (!user) {
      console.log("❌ No user found with ID from token:", decoded.id);
      return res.status(401).json({ authenticated: false });
    }

    console.log("👤 User found:", user);

    res.status(200).json({
      authenticated: true,
      userId: decoded.id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.log("❌ JWT verification failed:", err.message);
    res.status(401).json({ authenticated: false });
  }
};

exports.logout = (req, res) => {
  console.log("🚪 Logout endpoint hit");

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.USE_NGROK === 'true' || process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.USE_NGROK === 'true' || process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};