// models/petModel.js
class Pet {
    constructor(id, name, type, superpower, heroId, health = 10, status = 'excelente', coins = 0, illness = null, personality = 'Cariñoso', originalPersonality = 'Cariñoso') {
        this.id = id;
        this.name = name;
        this.type = type;
        this.superpower = superpower;
        this.heroId = heroId;
        this.health = health;
        this.status = status;
        this.coins = coins;
        this.illness = illness;
        this.personality = personality;
        this.originalPersonality = originalPersonality;
    }
}

export default Pet;