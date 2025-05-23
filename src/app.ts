import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';

// Environment variabelen laden
dotenv.config();

import { dbService } from './services/database';
import { authService } from './services/auth';
import { vereistInloggen, voegGebruikerToeAanViews } from './middleware/auth';

import authRouter from './routes/auth';
import charactersRouter from './routes/characters';
import teamsRouter from './routes/teams';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware functies
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//hierdoor onthoudt de browser dat je ingelogd bent
app.use(session({
    secret: process.env.SESSION_SECRET || 'verander-dit-in-productie',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        dbName: 'marvel_rivals'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    }
}));

// Hierdoor kunnen we in de navbar de gebruikersnaam laten zien
app.use(voegGebruikerToeAanViews);


app.use('/auth', authRouter);


app.get('/', vereistInloggen, (req, res) => {
    res.render('index', {
        title: 'Marvel Rivals Dashboard',
        currentPage: 'home'
    });
});

app.use('/characters', vereistInloggen, charactersRouter);
app.use('/teams', vereistInloggen, teamsRouter);

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: Math.floor(process.uptime())
    });
});

//niet gevonden pagina
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Pagina niet gevonden',
        error: 'De pagina die je zoekt bestaat niet.',
        currentPage: ''
    });
});

async function startApp() {
    try {
        console.log('App wordt opgestart...');

        console.log('Database maakt verbinding...');
        await dbService.verbindMetDatabase();

        console.log('data controleren...');
        if (!(await dbService.heeftData())) {
            console.log('is leeg, data laden...');
            await dbService.laadBeginData();
        } else {
            console.log('heeft al data');
        }

        console.log('Gebruikers instellen...');
        await authService.maakStandaardGebruikersAan();

        app.listen(port, () => {
            console.log(`Server is gestart op poort ${port}`);
            console.log(`Ga naar http://localhost:${port} `);
            console.log('Je kunt inloggen met admin/admin123 of user/user123');
        });
    } catch (error) {
        console.error('App opstarten mislukt:', error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('App wordt afgesloten...');
    await dbService.sluitVerbinding();
    process.exit(0);
});

startApp();