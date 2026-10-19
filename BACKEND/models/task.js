const fs = require('fs');
const path = require('path');

const readDatabase = (name) => {
  const file = path.resolve(__dirname, '../database', `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const getNextTaskID = () => {
  let biggestID = 0;
  for (const task of readDatabase('tasks')){
    if (task.id > biggestID){
      biggestID = task.id;
    }
  }
  return biggestID + 1;
}

class TaskException{
  constructor(errorMessage) {
    this.errorMessage = errorMessage;
  }
}

class Task {
  #id;
  #title;
  #description;
  #due_date;
  #owner;
  #status;
  #tags;
  
  constructor(title, description, due_date, owner, status, tags) {
    this.#id = getNextTaskID();
    this.title = title;
    this.description = description;
    this.due_date = due_date;
    this.owner = owner;
    this.status = status;
    this.tags = tags;
  }
  
  get id() {
    return this.#id;
  }
  
  set id(value) {
    throw new TaskException("IDs are auto-generated");
  }

  get title() {
    return this.#title;
  }

  set title(value) {
    if (typeof value !== 'string' || value.trim() === "") {
      throw new TaskException("El titulo no puede estár vacío");
    }
    this.#title = value;
  }

  get description() {
    return this.#description;
  }

  set description(value) {
    this.#description = value;
  }

  get due_date() {
    return this.#due_date;
  }

  set due_date(value) {
    if (isNaN(new Date(value).getTime())) {
      throw new TaskException("La fecha no es válida");
    }
    this.#due_date = value;
  }

  get owner() {
    return this.#owner;
  }

  set owner(value) {
    const user = readDatabase('users').find(user => user.id === value);
    if (user === undefined) {
      throw new TaskException("Owner should be the ID of an existing user");
    }
    this.#owner = value;
  }

  get status() {
    return this.#status;
  }

  set status(value) {
    if (!["A", "F", "C"].includes(value)) {
      throw new TaskException("Tag has to be only one of the following values: A/F/C");
    }
    this.#status = value;
  }

  get tags() {
    return this.#tags;
  }

  set tags(value) {
    if (!Array.isArray(value)) {
      throw new TaskException("Tags value should be an array");
    } 
    for (const id of value){
      if(!readDatabase('tags').some(tag => tag.id === id)) {
        throw new TaskException("Tag with ID " + id + " does not exist");
      }
    }
    this.#tags = value;
  }
}

module.exports = Task;
