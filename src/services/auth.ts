import bcrypt from 'bcrypt';
import { User } from '../interfaces';
import { dbService } from './database';

class AuthService {
    private saltRondes = 10; // minder dan 12 want dat duurt echt lang bij het testen

    // Wachtwoord hashen - bcrypt zorgt dat het veilig opgeslagen wordt
    async hashWachtwoord(wachtwoord: string): Promise<string> {
        return bcrypt.hash(wachtwoord, this.saltRondes);
    }

    async controleerWachtwoord(wachtwoord: string, hash: string): Promise<boolean> {
        return bcrypt.compare(wachtwoord, hash);
    }

    // Nieuwe gebruiker aanmaken, dit gebruik ik zowel voor registratie als voor de standaard accounts
    async maakGebruikerAan(gebruikersnaam: string, wachtwoord: string, rol: 'ADMIN' | 'USER' = 'USER'): Promise<User | null> {
        if (!gebruikersnaam || !wachtwoord) return null;
        if (gebruikersnaam.length < 3 || wachtwoord.length < 6) return null;

        const bestaatAl = await dbService.vindGebruikerOpNaam(gebruikersnaam);
        if (bestaatAl) return null;

        const gehashWachtwoord = await this.hashWachtwoord(wachtwoord);
        const nieuweGebruiker: Omit<User, '_id'> = {
            username: gebruikersnaam.toLowerCase().trim(), // altijd lowercase opslaan
            password: gehashWachtwoord,
            role: rol,
            createdAt: new Date()
        };

        return dbService.maakGebruikerAan(nieuweGebruiker);
    }

    // Inloggen - gebruikersnaam en wachtwoord checken
    async logIn(gebruikersnaam: string, wachtwoord: string): Promise<User | null> {
        if (!gebruikersnaam || !wachtwoord) return null;

        const gebruiker = await dbService.vindGebruikerOpNaam(gebruikersnaam.toLowerCase().trim());
        if (!gebruiker) return null;

        const wachtwoordKlopt = await this.controleerWachtwoord(wachtwoord, gebruiker.password);
        return wachtwoordKlopt ? gebruiker : null;
    }


    async maakStandaardGebruikersAan(): Promise<void> {
        console.log('Standaard gebruikers aanmaken...');
        const adminBestaat = await dbService.vindGebruikerOpNaam('admin');
        if (!adminBestaat) {
            await this.maakGebruikerAan('admin', 'admin123', 'ADMIN');
            console.log('Admin gebruiker aangemaakt');
        }

        const gebruikerBestaat = await dbService.vindGebruikerOpNaam('user');
        if (!gebruikerBestaat) {
            await this.maakGebruikerAan('user', 'user123', 'USER');
            console.log('Test gebruiker aangemaakt');
        }
    }
}

export const authService = new AuthService();