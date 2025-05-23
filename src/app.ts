import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import { dbService } from './services/database';

// Load environment variables
dotenv.config();

// Routes imports
import charactersRouter from './routes/characters';
import teamsRouter from './routes/teams';

const app = express();
const port: number = parseInt(process.env.PORT || '3000');

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// CORS headers for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.render('index', {
        title: 'Marvel Rivals Dashboard',
        currentPage: 'home'
    });
});

app.use('/characters', charactersRouter);
app.use('/teams', teamsRouter);

// Error handling middleware
app.use((req: Request, res: Response) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        error: 'The requested page could not be found.',
        currentPage: ''
    });
});

// Initialize database and start server
async function startServer() {
    try {
        // Connect to MongoDB
        await dbService.connect();

        // Check if database has data, if not initialize it
        if (!(await dbService.hasData())) {
            console.log('📦 Database is empty, initializing with JSON data...');
            await dbService.initializeData();
        } else {
            console.log('✅ Database already has data, skipping initialization');
        }

        // Start server
        app.listen(port, () => {
            console.log(`🚀 Marvel Rivals app running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await dbService.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await dbService.disconnect();
    process.exit(0);
});

startServer();