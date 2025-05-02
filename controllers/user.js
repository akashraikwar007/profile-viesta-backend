const User = require('../models/user')
const fs = require('fs').promises;
const path = require('path');

// Get base URL from environment variable or use default
const BASE_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:9000';

async function handleGetAllUsers(req, res) {
    try {
        console.log('Fetching all users...');
        const { sortBy, sortOrder, search, page = 1, limit = 5, gender, jobTitle, startDate, endDate } = req.query;
        
        // Build query object for search and filters
        let query = {};
        
        // Search functionality
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { jobTitle: { $regex: search, $options: 'i' } },
                { gender: { $regex: search, $options: 'i' } }
            ];
        }
        console.log(req.user);
        query.createdBy = req.user._id; // Filter by the logged-in user
        // Gender filter
        if (gender) {
            query.gender = gender;
        }

        // Job title filter
        if (jobTitle) {
            query.jobTitle = { $regex: jobTitle, $options: 'i' };
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }
        
        // Build sort object
        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        } else {
            // Default sort by createdAt in descending order
            sortOptions = { createdAt: -1 };
        }

        // Calculate pagination
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Get total count for pagination
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limitNumber);

        // Get paginated users
        const allDbUsers = await User.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber);
        
        // Transform the image paths to include the full URL
        const usersWithImageUrls = allDbUsers.map(user => {
            const userObj = user.toObject();
            if (userObj.profileImage) {
                const imagePath = userObj.profileImage.replace(/\\/g, '/');
                userObj.profileImage = `${BASE_URL}/uploads/${path.basename(imagePath)}`;
                console.log('Image URL:', userObj.profileImage);
            }
            return userObj;
        });

        console.log(`Found ${usersWithImageUrls.length} users`);
        return res.json({
            users: usersWithImageUrls,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalUsers,
                usersPerPage: limitNumber
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
}

async function handleGetUserById(req, res) {
    try {
        console.log(`Fetching user with id: ${req.params.id}`);
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: "User not found" });
        }
        const userObj = user.toObject();
        if (userObj.profileImage) {
            const imagePath = userObj.profileImage.replace(/\\/g, '/');
            userObj.profileImage = `${BASE_URL}/uploads/${path.basename(imagePath)}`;
            console.log('Image URL:', userObj.profileImage);
        }
        console.log('User found:', userObj);
        return res.json(userObj);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: "Failed to fetch user" });
    }
}

async function handleUpdateUserById(req, res) {
    try {
        console.log(`Updating user with id: ${req.params.id}`);
        const updateData = { ...req.body };

        if (updateData.email) {
            const existingUser = await User.findOne({ email: updateData.email });
            if (existingUser && existingUser._id.toString() !== req.params.id.toString()) {
                return res.status(400).json({ error: "Email already exists" });
            }
        }
        
        // If there's a file upload, add it to the update data
        if (req.file) {
            console.log('File uploaded:', req.file);
            // Get the old user to check for existing image
            const oldUser = await User.findById(req.params.id);
            if (oldUser && oldUser.profileImage) {
                // Delete the old image file
                const oldImagePath = path.join(__dirname, '..', oldUser.profileImage);
                try {
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }
            // Store just the filename
            updateData.profileImage = req.file.filename;
            console.log('New image path:', updateData.profileImage);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: "User not found" });
        }
        const userObj = user.toObject();
        if (userObj.profileImage) {
            userObj.profileImage = `${BASE_URL}/uploads/${userObj.profileImage}`;
            console.log('Updated image URL:', userObj.profileImage);
        }
        console.log('User updated:', userObj);
        return res.json(userObj);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: "Failed to update user" });
    }
}

async function handleDeleteUserById(req, res) {
    try {
        console.log(`Deleting user with id: ${req.params.id}`);
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: "User not found" });
        }

        // Delete the profile image if it exists
        if (user.profileImage) {
            const imagePath = path.join(__dirname, '..', 'uploads', user.profileImage);
            try {
                await fs.unlink(imagePath);
                console.log('Deleted image file:', imagePath);
            } catch (err) {
                console.error('Error deleting image:', err);
            }
        }

        await User.findByIdAndDelete(req.params.id);
        console.log('User deleted:', user);
        return res.json({ message: "User deleted" });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: "Failed to delete user" });
    }
}

async function handleCreateNewUser(req, res) {
    try {
        console.log('Creating new user:', req.body);
        const { firstName, lastName, email, jobTitle, gender } = req.body;
      
        if (!firstName || !lastName || !email || !gender) {
            console.log('Missing required fields');
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== req.params.id.toString()) {
            return res.status(400).json({ error: "Email already exists" });
        }
      
        const userData = { firstName, lastName, email, jobTitle, gender };
        userData.createdBy = req.user._id; // Set the creator of the user
        // If there's a file upload, add it to the user data
        if (req.file) {
            console.log('File uploaded:', req.file);
            // Store just the filename
            userData.profileImage = req.file.filename;
            console.log('New image path:', userData.profileImage);
        }

        const newUser = new User(userData);
        const savedUser = await newUser.save();
        const userObj = savedUser.toObject();
        if (userObj.profileImage) {
            userObj.profileImage = `${BASE_URL}/uploads/${userObj.profileImage}`;
            console.log('Created image URL:', userObj.profileImage);
        }
        console.log('User created:', userObj);
        res.status(201).json({ message: "User created successfully", user: userObj });
    } catch (error) {
        console.error('Error creating user:', error);
        // If there was a file upload and the save failed, delete the uploaded file
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
                console.log('Deleted uploaded file after error:', req.file.path);
            } catch (err) {
                console.error('Error deleting uploaded file:', err);
            }
        }
        res.status(500).json({ error: "Failed to create user", details: error.message });
    }
}

module.exports = { handleGetAllUsers, handleGetUserById, handleUpdateUserById, handleDeleteUserById, handleCreateNewUser };
