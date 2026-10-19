const User = require('../models/user');
const fs = require('fs');
const path = require('path');

const readDatabase = (name) => {
  const file = path.resolve(__dirname, '../database', `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

exports.registerUser = (req, res) => {
  try {
    if (req.body.password !== req.body.confirm_password) {
      res.status(400).send('Passwords do not match');
    }
    else {
      let new_user = new User(req.body.name, req.body.email, req.body.password);
      let users = readDatabase('users');
      users.push(new_user.toObj());
      fs.writeFileSync(path.resolve(__dirname, '../database/users.json'), JSON.stringify(users, null, 2));
      res.send("Usuario registrado exitosamente");
    }
  } catch (error) {
    res.status(400).send(error.message || error.errorMessage || "Error al registrar usuario");
  }
};

exports.getUsers = (req, res) => {
  if (req.get('x-auth') !== 'admin_auth') {
    return res.status(401).send('Unauthorized');
  }
  let users = readDatabase('users');
  const page = Number(req.query.page || 1);
  const per_page = Number(req.query.limit || 5);
  let start = (page - 1) * per_page;
  let end = start + per_page;
  let paginatedUsers = users.slice(start, end);
  res.json({
    page: page,
    next_page: page + 1,
    limit: per_page,
    total: users.length,
    data: paginatedUsers
  });
}

exports.authUsersMiddleware = (req, res, next) => {
  const id = Number(req.params.id);
  const users = readDatabase('users');
  const user = users.find(u => u.id === id);
  
  if (!user){
    return res.status(404).send('User not found');
  }

  if (req.get('x-auth') !== user.password) {
    return res.status(401).send('Unauthorized');
  }
  req.user = user;
  next();
}

exports.getUserById = (req, res) => {
  res.json(req.user);
}

exports.patchUser = (req, res) =>  {
  const fields = ['name', 'email', 'password'];
  const body = req.body || {};

  if (!fields.some(field => Object.hasOwn(body, field))) {
    return res.status(400).send('No valid fields to update');
  }

  try {
    const users = readDatabase('users');
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    const current = users[userIndex];
    
    const user = new User(
      current.name,
      current.email,
      current.password,
      current.id,
      current.joined_at
    );

    for (const field of fields){
      if (Object.hasOwn(body, field)){
        user[field] = body[field];
      }
    }

    const updatedUser = user.toObj();
    users[userIndex] = updatedUser;

    fs.writeFileSync(
      path.resolve(__dirname, '../database/users.json'),
      JSON.stringify(users, null, 2)
    );

    return res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error.errorMessage) {
      return res.status(400).send(error.errorMessage);
    }
    return res.status(500).send('Internnal server error');
  }
};

exports.deleteUser = (req, res) => {
  const users = readDatabase('users');
  const userIndex = users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).send('User not found');
  }

  users.splice(userIndex, 1);
  fs.writeFileSync(
    path.resolve(__dirname, '../database/users.json'),
    JSON.stringify(users, null, 2)
  );

  return res.status(200).json({
    message: 'User with ID ' + req.user.id + ' deleted successfully',
    user: req.user
  })
};
