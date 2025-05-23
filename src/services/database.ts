import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Character, Team, User, UserDB } from '../interfaces';

class DatabaseService {
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private karakters: Collection<Character> | null = null;
    private teams: Collection<Team> | null = null;
    private gebruikers: Collection<UserDB> | null = null;

    // Verbinding maken met de database
    async verbindMetDatabase(): Promise<void> {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        console.log('Verbinding maken met MongoDB...');

        this.client = new MongoClient(uri);
        await this.client.connect();

        await this.client.db("admin").command({ ping: 1 });

        this.db = this.client.db('marvel_rivals');
        this.karakters = this.db.collection<Character>('characters');
        this.teams = this.db.collection<Team>('teams');
        this.gebruikers = this.db.collection<UserDB>('users');

        console.log('Database verbinding gemaakt');
    }

    async sluitVerbinding(): Promise<void> {
        if (this.client) {
            await this.client.close();
            console.log('Database verbinding gesloten');
        }
    }

    async heeftData(): Promise<boolean> {
        if (!this.karakters || !this.teams) return false;

        const aantalKaracters = await this.karakters.countDocuments();
        const aantalTeams = await this.teams.countDocuments();

        return aantalKaracters > 0 && aantalTeams > 0;
    }


    async laadBeginData(): Promise<void> {
        if (!this.karakters || !this.teams) throw new Error('Database niet verbonden');

        console.log('Data laden van GitHub...');

        const [karaktersResponse, teamsResponse] = await Promise.all([
            fetch('https://raw.githubusercontent.com/Javii995/Project_webontwikkeling_2025/main/MarvelCharacters.json'),
            fetch('https://raw.githubusercontent.com/Javii995/Project_webontwikkeling_2025/main/Teams.json')
        ]);

        const karakters = await karaktersResponse.json();
        const teams = await teamsResponse.json();

        await this.karakters.deleteMany({});
        await this.teams.deleteMany({});

        await this.karakters.insertMany(karakters);
        await this.teams.insertMany(teams);

        console.log(`${karakters.length} karakters en ${teams.length} teams geladen`);
    }


    async haalAlleKaraktersOp(): Promise<Character[]> {
        if (!this.karakters) throw new Error('Database niet verbonden');
        return this.karakters.find({}).toArray();
    }

    async vindKarakterOpId(id: string): Promise<Character | null> {
        if (!this.karakters) throw new Error('Database niet verbonden');
        return this.karakters.findOne({ id });
    }

    async zoekKaracters(zoekterm: string): Promise<Character[]> {
        if (!this.karakters) throw new Error('Database niet verbonden');
        return this.karakters.find({
            name: { $regex: zoekterm, $options: 'i' } // 'i' betekent case insensitive
        }).toArray();
    }

    async haalKaraktersOpGesorteerd(sorteerVeld: string, sorteerRichting: 'asc' | 'desc'): Promise<Character[]> {
        if (!this.karakters) throw new Error('Database niet verbonden');

        const richting = sorteerRichting === 'desc' ? -1 : 1;
        const veld = sorteerVeld === 'team' ? 'team.name' : sorteerVeld;

        return this.karakters.find({}).sort({ [veld]: richting }).toArray();
    }

    // Karakter gegevens bijwerken - alleen admins mogen dit
    async werkKarakterBij(id: string, updates: Partial<Character>): Promise<boolean> {
        if (!this.karakters) throw new Error('Database niet verbonden');

        const resultaat = await this.karakters.updateOne({ id }, { $set: updates });
        return resultaat.modifiedCount > 0;
    }

    async haalKaraktersOpVanTeam(teamId: string): Promise<Character[]> {
        if (!this.karakters) throw new Error('Database niet verbonden');
        return this.karakters.find({ 'team.id': teamId }).toArray();
    }


    async haalAlleTeamsOp(): Promise<Team[]> {
        if (!this.teams) throw new Error('Database niet verbonden');
        return this.teams.find({}).toArray();
    }

    async vindTeamOpId(id: string): Promise<Team | null> {
        if (!this.teams) throw new Error('Database niet verbonden');
        return this.teams.findOne({ id });
    }

    async haalTeamsOpGesorteerd(sorteerVeld: string, sorteerRichting: 'asc' | 'desc'): Promise<Team[]> {
        if (!this.teams) throw new Error('Database niet verbonden');

        const richting = sorteerRichting === 'desc' ? -1 : 1;
        return this.teams.find({}).sort({ [sorteerVeld]: richting }).toArray();
    }

    async maakGebruikerAan(gebruiker: Omit<User, '_id'>): Promise<User | null> {
        if (!this.gebruikers) throw new Error('Database niet verbonden');

        try {
            const gebruikerDoc = {
                username: gebruiker.username,
                password: gebruiker.password,
                role: gebruiker.role,
                createdAt: gebruiker.createdAt
            };

            const resultaat = await this.gebruikers.insertOne(gebruikerDoc);

            return {
                _id: resultaat.insertedId.toString(),
                ...gebruiker
            };
        } catch (error) {
            console.error('Fout bij gebruiker aanmaken:', error);
            return null;
        }
    }

    // Gebruiker ophalen op basis van gebruikersnaam - voor inloggen
    async vindGebruikerOpNaam(gebruikersnaam: string): Promise<User | null> {
        if (!this.gebruikers) throw new Error('Database niet verbonden');

        const gebruikerDoc = await this.gebruikers.findOne({ username: gebruikersnaam.toLowerCase() });
        if (!gebruikerDoc) return null;

        return {
            _id: gebruikerDoc._id?.toString(),
            username: gebruikerDoc.username,
            password: gebruikerDoc.password,
            role: gebruikerDoc.role,
            createdAt: gebruikerDoc.createdAt
        };
    }

    async vindGebruikerOpId(id: string): Promise<User | null> {
        if (!this.gebruikers) throw new Error('Database niet verbonden');

        try {
            if (!ObjectId.isValid(id)) return null;

            const gebruikerDoc = await this.gebruikers.findOne({ _id: new ObjectId(id) });
            if (!gebruikerDoc) return null;

            return {
                _id: gebruikerDoc._id?.toString(),
                username: gebruikerDoc.username,
                password: gebruikerDoc.password,
                role: gebruikerDoc.role,
                createdAt: gebruikerDoc.createdAt
            };
        } catch (error) {
            console.error('Fout bij gebruiker ophalen:', error);
            return null;
        }
    }
}

export const dbService = new DatabaseService();