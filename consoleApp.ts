import * as fs from "fs";
import * as readline from "readline";
import { Character } from "./interfaces";

// Lees JSON-bestand in
const characters: Character[] = JSON.parse(fs.readFileSync("MarvelCharacters.json", "utf8"));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function showMenu(): void {
    console.log("\nWelcome to the Marvel Rivals JSON Viewer!\n");
    console.log("1. View all characters");
    console.log("2. Filter by ID");
    console.log("3. Exit");

    rl.question("\nPlease enter your choice: ", (choice: string) => {
        if (choice === "1") {
            displayAllCharacters();
        } else if (choice === "2") {
            rl.question("\nPlease enter the ID you want to filter by: ", (id: string) => {
                displayCharacterById(id);
            });
        } else if (choice === "3") {
            console.log("\nGoodbye!");
            rl.close();
        } else {
            console.log("\nInvalid choice. Please try again.");
            showMenu();
        }
    });
}

function displayAllCharacters(): void {
    console.log("\nCharacters List:\n");
    characters.forEach((character) => {
        console.log(`- ${character.name} (${character.id})`);
    });
    showMenu();
}

function displayCharacterById(id: string): void {
    const character = characters.find((char) => char.id.toUpperCase() === id.toUpperCase());

    if (!character) {
        console.log("\n❌ Character not found. Please enter a valid ID.");
    } else {
        console.log(`\n- ${character.name} (${character.id})`);
        console.log(`  - Real Name: ${character.realName}`);
        console.log(`  - Description: ${character.description}`);
        console.log(`  - Age: ${character.age}`);
        console.log(`  - Active: ${character.isActive ? "Yes" : "No"}`);
        console.log(`  - Birthdate: ${character.birthDate}`);
        console.log(`  - Image: ${character.imageUrl}`);
        console.log(`  - Affiliation: ${character.affiliation}`);
        console.log(`  - Powers: ${character.powers.join(", ")}`);
        console.log(`  - First Appearance: ${character.firstAppearance}`);
        console.log(`  - Team: ${character.team.name}`);
        console.log(`    - Leader: ${character.team.leader}`);
        console.log(`    - Headquarters: ${character.team.headquarters}`);
        console.log(`    - Founded: ${character.team.foundedYear}`);
        console.log(`    - Motto: ${character.team.motto}`);
        console.log(`    - Logo: ${character.team.teamLogoUrl}`);
    }
    showMenu();
}

showMenu();
