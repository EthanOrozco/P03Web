const fs = require('fs');
const path = require('path');

const readDatabase = (name) => {
  const file = path.resolve(__dirname, '../database', `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const getNextTagID = () => {
  let biggestID = 0;
  for (const tag of readDatabase('tags')){
    if (tag.id > biggestID){
      biggestID = tag.id;
    }
  }
  return biggestID + 1;
}

class TagException{
  constructor(errorMessage) {
    this.errorMessage = errorMessage;
  }
}

class Tag{
  #id;
  #name;
  #color;

  constructor(name, color) {
    this.#id = getNextTagID();
    this.name = name;
    this.color = color;
  }
  
  get id() {
    return this.#id;
  }
  
  set id(value) {
    throw new TagException("IDs are auto-generated");
  }
  
  get name() {
    return this.#name;
  }
  
  set name(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new TagException("El nombre debe ser un texto no vacío");
    }
    this.#name = value.trim();
  }

  get color() {
    return this.#color;
  }

  set color(value) {
    if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) {
      throw new TagException("El color debe tener formato #RRGGBB");
    }
    this.#color = value;
  }
  
}

module.exports = Tag;
