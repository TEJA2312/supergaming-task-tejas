const ApiError = require('../config/error.js');
const userRepository = require('../user/user.repository.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(inputPassword, hashedPassword) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

const createUserAdminOnly = async ({ body, user }) => {
  try{
    
    const userDetails = await userRepository.findUserById(user.id);

    if(userDetails.role != 'admin') throw new ApiError(403, 'Sorry, Only Admin can access this route');
    
    if(body.role === 'admin') throw new ApiError(403, 'Sorry, Role Admin cannot be created');
    
    body.password = await hashPassword(body.password);
    return await userRepository.createUser(body);

  } catch (error) {
    throw new ApiError(504, error)
  }
}

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, 'Please provide email and password');

    const user = await userRepository.findUserByEmail(email);

    if (!user) throw new ApiError(404, 'No user found with this email');
    

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      throw new ApiError(403, 'Wrong password or email.');
    }

    const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '10d',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: 'Strict', 
      maxAge: 10 * 24 * 60 * 60 * 1000 
    });

    await userRepository.updateUser({
      accessToken: accessToken,
      refreshToken: refreshToken,
      loginAttempts: user.loginAttempts + 1
    }, user._id)

   return accessToken;

  } catch (error) {
    throw new ApiError(500, error.message || 'Internal Server Error');
  }
};

const grantNewAccessToken = async ({ user }) => {
  try{

    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 60,
    });

    await userRepository.updateUser({
      accessToken: accessToken
    }, user.id)

    return accessToken;
     
  } catch (error) {
    throw new ApiError(504, error)
  }
}

const changePassword = async ({ body, user }) => {
  try{

    const { oldPassword, newPassword } = body;

    const userDetails = await userRepository.findUserById(user.id);

    if(userDetails.loginAttempts > 1) throw new ApiError(403, 'You can change password only after first login');

    const isPasswordCorrect = await comparePassword(oldPassword, userDetails.password);

    if(!isPasswordCorrect) throw new ApiError(403, 'Old Password is incorrect');

    if(oldPassword === newPassword) throw new ApiError(400, 'Old Password and New Password cannot be same');

    const newHashPassword = await hashPassword(body.newPassword);

    await userRepository.updateUser({
     password: newHashPassword
    }, userDetails._id)

    return 'successfully changed the password';
     
  } catch (error) {
    throw new ApiError(504, error)
  }
}

const getUserDetailsForClient = async ({ user }) => {
  try{
    
    let {
      email,
      role,
      loginAttempts,
      createdAt,
      updatedAt
    } = await userRepository.findUserById(user.id);

    return {
      email,
      role,
      loginAttempts,
      createdAt,
      updatedAt
    }

  } catch (error) {
    throw new ApiError(504, error)
  }
}


module.exports = {
  createUserAdminOnly,
  grantNewAccessToken,
  userLogin,
  changePassword,
  getUserDetailsForClient
};