const express = require('express');
const usersController = require('../controllers/users_api_controller');
const routerUsers = express.Router();

routerUsers.post('/', usersController.registerUser);
routerUsers.get('/', usersController.getUsers);
routerUsers.use('/:id', usersController.authUsersMiddleware);
routerUsers.get('/:id', usersController.getUserById);
routerUsers.patch('/:id', usersController.patchUser);
routerUsers.delete('/:id', usersController.deleteUser);
module.exports = routerUsers;
