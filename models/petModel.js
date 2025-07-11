// models/petModel.js
class Pet {
    constructor(id, name, type, superpower, heroId) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.superpower = superpower;
        this.heroId = heroId;
    }
}

export default Pet;