const User = require('../user/user.model.js');

const createUser = async (data) => {
  return await User.create(data);
}

const updateUser = async (data, id) => {
  return await User.findByIdAndUpdate(
    id, data, { new: true, runValidators: true } 
  );
}

const findUserByEmail = async (email) => {
  return await User.findOne({ email: email });
}

const findUserById = async (id) => {
  return await User.findById(id);
}

module.exports = {
  createUser,
  updateUser,
  findUserByEmail,
  findUserById
};