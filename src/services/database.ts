import { MongoClient, Db, Collection } from 'mongodb';
import { Character, Team } from '../interfaces';

class DatabaseService {
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private charactersCollection: Collection<Character> | null = null;
    private teamsCollection: Collection<Team> | null = null;

    private initializeClient(): void {
        if (!this.client) {
            // Connection string from environment variables
            const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

            // DEBUG: Log the connection string (hide password)
            console.log('🔧 Using MongoDB URI:', uri.replace(/:[^:]*@/, ':***@'));

            this.client = new MongoClient(uri);
            this.db = this.client.db('marvel_rivals');
            this.charactersCollection = this.db.collection<Character>('characters');
            this.teamsCollection = this.db.collection<Team>('teams');
        }
    }

    async connect(): Promise<void> {
        try {
            console.log('🔄 Attempting to connect to MongoDB...');

            // Initialize client with current environment variables
            this.initializeClient();

            if (!this.client) {
                throw new Error('Failed to initialize MongoDB client');
            }

            await this.client.connect();

            // Test the connection
            await this.client.db("admin").command({ ping: 1 });
            console.log('✅ Connected to MongoDB and ping successful');
        } catch (error) {
            console.error('❌ Error connecting to MongoDB:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            console.log('🔌 Disconnected from MongoDB');
        }
    }

    // Check if database has data
    async hasData(): Promise<boolean> {
        if (!this.charactersCollection || !this.teamsCollection) {
            throw new Error('Database not connected');
        }
        const characterCount = await this.charactersCollection.countDocuments();
        const teamCount = await this.teamsCollection.countDocuments();
        return characterCount > 0 && teamCount > 0;
    }

    // Initialize database with JSON data
    async initializeData(): Promise<void> {
        if (!this.charactersCollection || !this.teamsCollection) {
            throw new Error('Database not connected');
        }

        try {
            console.log('🔄 Initializing database with JSON data...');

            // Fetch data from GitHub (same as before)
            const [charactersResponse, teamsResponse] = await Promise.all([
                fetch('https://raw.githubusercontent.com/Javii995/Project_webontwikkeling_2025/main/MarvelCharacters.json'),
                fetch('https://raw.githubusercontent.com/Javii995/Project_webontwikkeling_2025/main/Teams.json')
            ]);

            if (!charactersResponse.ok || !teamsResponse.ok) {
                throw new Error('Failed to fetch JSON data');
            }

            const characters: Character[] = await charactersResponse.json();
            const teams: Team[] = await teamsResponse.json();

            // Clear existing data
            await this.charactersCollection.deleteMany({});
            await this.teamsCollection.deleteMany({});

            // Insert new data
            await this.charactersCollection.insertMany(characters);
            await this.teamsCollection.insertMany(teams);

            console.log(`✅ Inserted ${characters.length} characters and ${teams.length} teams`);
        } catch (error) {
            console.error('❌ Error initializing data:', error);
            throw error;
        }
    }

    // Characters CRUD operations
    async getAllCharacters(): Promise<Character[]> {
        if (!this.charactersCollection) throw new Error('Database not connected');
        return await this.charactersCollection.find({}).toArray();
    }

    async getCharacterById(id: string): Promise<Character | null> {
        if (!this.charactersCollection) throw new Error('Database not connected');
        return await this.charactersCollection.findOne({ id });
    }

    async updateCharacter(id: string, updates: Partial<Character>): Promise<boolean> {
        if (!this.charactersCollection) throw new Error('Database not connected');
        const result = await this.charactersCollection.updateOne(
            { id },
            { $set: updates }
        );
        return result.modifiedCount > 0;
    }

    async searchCharacters(searchTerm: string): Promise<Character[]> {
        if (!this.charactersCollection) throw new Error('Database not connected');
        return await this.charactersCollection.find({
            name: { $regex: searchTerm, $options: 'i' }
        }).toArray();
    }

    // Teams CRUD operations
    async getAllTeams(): Promise<Team[]> {
        if (!this.teamsCollection) throw new Error('Database not connected');
        return await this.teamsCollection.find({}).toArray();
    }

    async getTeamById(id: string): Promise<Team | null> {
        if (!this.teamsCollection) throw new Error('Database not connected');
        return await this.teamsCollection.findOne({ id });
    }

    async getCharactersByTeamId(teamId: string): Promise<Character[]> {
        if (!this.charactersCollection) throw new Error('Database not connected');
        return await this.charactersCollection.find({
            'team.id': teamId
        }).toArray();
    }

    // Utility methods for sorting
    async getCharactersSorted(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<Character[]> {
        if (!this.charactersCollection) throw new Error('Database not connected');
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Handle nested sorting for team name
        if (sortBy === 'team') {
            return await this.charactersCollection.find({}).sort({ 'team.name': sortDirection }).toArray();
        }

        return await this.charactersCollection.find({}).sort({ [sortBy]: sortDirection }).toArray();
    }

    async getTeamsSorted(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<Team[]> {
        if (!this.teamsCollection) throw new Error('Database not connected');
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        return await this.teamsCollection.find({}).sort({ [sortBy]: sortDirection }).toArray();
    }
}

// Export singleton instance
export const dbService = new DatabaseService();