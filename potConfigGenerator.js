const fs = require('fs');
const readline = require('readline');

class POTConfigGenerator {
    constructor() {
        this.settings = {
            ServerName: "My Server",
            ServerPassword: "",
            MaxPlayers: 100,
            AdminPassword: "",
            bEnableGrowth: true,
            GrowthRate: 1.0,
            MarksMultiplier: 1.0,
            CombatLogTimer: 300,
            RestingGrowthRate: 1.0,
            PassiveGrowthRate: 1.0
        };
    }

    generateIni(settings = this.settings, filename = "Game.ini") {
        let iniContent = "[/Script/PathOfTitans.GameConfig]\n";
        
        for (const [key, value] of Object.entries(settings)) {
            if (typeof value === "boolean") {
                iniContent += `${key}=${value.toString().toLowerCase()}\n`;
            } else {
                iniContent += `${key}=${value}\n`;
            }
        }

        fs.writeFileSync(filename, iniContent);
        return iniContent;
    }
}

module.exports = { POTConfigGenerator };