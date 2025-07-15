const express = require('express');
const router = express.Router();
const userService = require('../user/user.service')
const middlewares = require('../config/middleware.js');

// route to create user and assign role to user - only for user with role admin
router.post('/createUserAdminOnly', middlewares.authenticateToken, async (req, res, next) => {
  try {

    const response = await userService.createUserAdminOnly(req);
    res.json(response);

  } catch (error) {
    next(error);
  }
});

// This route allows user to login using their pre-assigned password.
router.post('/login',  async (req, res, next) => {
  try {
    const response = await userService.userLogin(req, res);
    res.json(response);

  } catch (error) {
    next(error);
  }
});

// This route lets user to change their password but only after first login attempt
router.post('/changePassword', middlewares.authenticateToken,  async (req, res, next) => {
  try {
    const response = await userService.changePassword(req);
    res.json(response);

  } catch (error) {
    next(error);
  }
});

// This route is used to grant new access token (1 hour expiry) using refresh token saved in httpOnly cookie.
router.post('/grantNewAccessToken', middlewares.renewAccessGrant, async (req, res, next) => {
  try {
    const response = await userService.grantNewAccessToken(req);
    res.json(response);

  } catch (error) {
    next(error);
  }
});

router.get('/getUserDetailsForClient', middlewares.authenticateToken,  async (req, res, next) => {
  try {
    const response = await userService.getUserDetailsForClient(req);
    res.json(response);

  } catch (error) {
    next(error);
  }
});

module.exports = router;

