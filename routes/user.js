const express = require('express');
const router = express.Router();
const { handleUpdateUserById, handleGetUserById, handleGetAllUsers, handleDeleteUserById, handleCreateNewUser } = require('../controllers/user');
const { upload, handleMulterError } = require('../middleware/upload');

router.route("/", )
    .get(handleGetAllUsers)
    .post(upload.single('profileImage'), handleMulterError, handleCreateNewUser);

router.route("/:id")
    .get(handleGetUserById)
    .patch(upload.single('profileImage'), handleMulterError, handleUpdateUserById)
    .delete(handleDeleteUserById);

module.exports = router;