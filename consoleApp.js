"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var readline = require("readline");
var characters = JSON.parse(fs.readFileSync("MarvelCharacters.json", "utf8"));
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function showMenu() {
    console.log("\nWelcome to the Marvel Rivals JSON Viewer!\n");
    console.log("1. View all characters");
    console.log("2. Filter by ID");
    console.log("3. Exit");
    rl.question("\nPlease enter your choice: ", function (choice) {
        if (choice === "1") {
            displayAllCharacters();
        }
        else if (choice === "2") {
            rl.question("\nPlease enter the ID you want to filter by: ", function (id) {
                displayCharacterById(id);
            });
        }
        else if (choice === "3") {
            console.log("\nGoodbye!");
            rl.close();
        }
        else {
            console.log("\nInvalid choice. Please try again.");
            showMenu();
        }
    });
}
function displayAllCharacters() {
    console.log("\nCharacters List:\n");
    characters.forEach(function (character) {
        console.log("- ".concat(character.name, " (").concat(character.id, ")"));
    });
    showMenu();
}
function displayCharacterById(id) {
    var character = characters.find(function (char) { return char.id.toUpperCase() === id.toUpperCase(); });
    if (!character) {
        console.log("\n❌ Character not found. Please enter a valid ID.");
    }
    else {
        console.log("\n- ".concat(character.name, " (").concat(character.id, ")"));
        console.log("  - Real Name: ".concat(character.realName));
        console.log("  - Description: ".concat(character.description));
        console.log("  - Age: ".concat(character.age));
        console.log("  - Active: ".concat(character.isActive ? "Yes" : "No"));
        console.log("  - Birthdate: ".concat(character.birthDate));
        console.log("  - Image: ".concat(character.imageUrl));
        console.log("  - Affiliation: ".concat(character.affiliation));
        console.log("  - Powers: ".concat(character.powers.join(", ")));
        console.log("  - First Appearance: ".concat(character.firstAppearance));
        console.log("  - Team: ".concat(character.team.name));
        console.log("    - Leader: ".concat(character.team.leader));
        console.log("    - Headquarters: ".concat(character.team.headquarters));
        console.log("    - Founded: ".concat(character.team.foundedYear));
        console.log("    - Motto: ".concat(character.team.motto));
        console.log("    - Logo: ".concat(character.team.teamLogoUrl));
    }
    showMenu();
}
showMenu();
