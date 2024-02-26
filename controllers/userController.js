const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

// 164. Adding a /me endpoint
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find(); // query executed

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       tour: users,
//     },
//   });
// });
exports.getAllUsers = factory.getAll(User);

// 139. Updating the current user: Data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }

  // 2) Filtered out unwanted fields that are not allowed to be updated.
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  // since here we are not dealing with passwords, we can use findById and update (not save).
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// 140. Deleting the current user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead',
  });
};

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!',
//   });
// };

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!',
//   });
// };
exports.deleteUser = factory.deleteOne(User);
