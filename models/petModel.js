// models/petModel.js
class Pet {
    constructor(id, name, type, superpower, heroId, health = 10, status = 'excelente', coins = 0) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.superpower = superpower;
        this.heroId = heroId;
        this.health = health;
        this.status = status;
        this.coins = coins;
    }
}

export default Pet;