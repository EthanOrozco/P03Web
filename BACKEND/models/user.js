const fs = require('fs');
const path = require('path');

const readDatabase = (name) => {
  const file = path.resolve(__dirname, '../database', `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
};


const getNextUserID = () => {
  let biggestID = 0;
  for (const user of readDatabase('users')){
    if (user.id > biggestID){
      biggestID = user.id;
    }
  }

  return biggestID + 1;
}

class UserException{
  constructor(errorMessage) {
    this.errorMessage = errorMessage;
  }
}

class User{
  #id;
  #name;
  #email;
  #password;
  #joined_at;
  constructor(name, email, password, id, joined_at) {
    this.#id = id ?? getNextUserID();
    this.#joined_at = joined_at ? new Date(joined_at) : new Date();
    
    this.name = name;
    this.email = email;
    this.password = password;
  }
  get id() {
    return this.#id;
  }
  set id(value) {
    throw new UserException("IDs are auto-generated");
  }

  get name() {
    return this.#name;
  }

  get email() {
    return this.#email;
  }

  get password() {
    return this.#password;
  }
  
  get joined_at() {
    return this.#joined_at;
  }

  set joined_at(value) {
    throw new UserException("La fecha de registro no puede modificarse");
  }
  
  set name(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new UserException("Name can not be blank");
    }
    this.#name = value.trim();
  }

  set email(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new UserException("Email can not be blank");
    }
    const email = value.trim();
    const repetido = readDatabase('users').find(
      user => user.email === email && user.id !== this.id
    );
    if (repetido !== undefined) {
      throw new UserException("Emails should be unique");
    }
    this.#email = email;
  }
  
  set password(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new UserException("Password can not be blank");
    }
    if (value.length < 8) {
      throw new UserException("Password should be at least 8 characters")
    }
    const repeated = readDatabase('users').find(
      user => user.password === value && user.id !== this.id
    );
    if (repeated !== undefined) {
      throw new UserException("Passwords should be unique");
    }
    this.#password = value;
  }
  toObj() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      joined_at: this.joined_at,
    };
  }
}

module.exports = User;
