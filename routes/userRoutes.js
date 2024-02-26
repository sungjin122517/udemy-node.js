const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// 3) ROUTES

// mounting new router
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword); // uses patch since we are maniupating the user document

// 165. Adding missing authentication and authorization
router.use(authController.protect); // protect all the routes that come after this point

router.patch('/updateMyPassword', authController.updatePassword); // protect, since this will only work for logged in users
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
