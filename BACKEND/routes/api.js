const express = require('express');
const path = require('path');
const userRoutes = require('./users.js');

const routerApi = express.Router();

const authMiddleware = (req, res, next) => {
  if (!req.get('x-auth')){
    return res.status(401).send('Unauthorized');
  }
  next();
};

routerApi.use("/home.html", authMiddleware);
routerApi.use("/tasks.html", authMiddleware);
routerApi.use("/users", userRoutes);


routerApi.get('/', (req, res) => {
  const file = req.get('x-auth') ? 'home.html' : 'login.html';
  res.sendFile(path.resolve(__dirname, `../../FRONTEND/views/${file}`));
});

routerApi.get('/home.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../FRONTEND/views/home.html'))
});

routerApi.get('/login.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../FRONTEND/views/login.html'))
});

routerApi.get('/tasks.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../FRONTEND/views/tasks.html'))
});


module.exports = routerApi;