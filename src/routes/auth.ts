import express, { Request, Response } from 'express';
import { authService } from '../services/auth';
import { omleidenAlsIngelogd } from '../middleware/auth';

const router = express.Router();

// Handle login
router.post('/login', omleidenAlsIngelogd, async (req: Request, res: Response) => {
    const { username, password } = req.body;

    console.log('🔍 Login poging voor:', username);

    if (!username || !password) {
        console.log('❌ Lege velden');
        return res.render('auth/login', {
            title: 'Inloggen',
            currentPage: 'login',
            error: 'Vul beide velden in.'
        });
    }

    // Proberen in te loggen met de auth service
    console.log('🔍 Zoeken naar gebruiker...');
    const gebruiker = await authService.logIn(username, password);
    console.log('🔍 Gebruiker gevonden:', gebruiker ? 'JA' : 'NEE');

    if (!gebruiker) {
        console.log('❌ Login mislukt');
        return res.render('auth/login', {
            title: 'Inloggen',
            currentPage: 'login',
            error: 'Verkeerde gebruikersnaam of wachtwoord.'
        });
    }

    console.log('✅ Login gelukt, sessie maken...');
    // rest van je code...
});

// Login pagina tonen
router.get('/login', omleidenAlsIngelogd, (req: Request, res: Response) => {
    res.render('auth/login', {
        title: 'Inloggen',
        currentPage: 'login',
        error: null
    });
});


router.post('/login', omleidenAlsIngelogd, async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // zijn beide velden ingevuld?
    if (!username || !password) {
        return res.render('auth/login', {
            title: 'Inloggen',
            currentPage: 'login',
            error: 'Vul beide velden in.'
        });
    }

    const gebruiker = await authService.logIn(username, password);

    if (!gebruiker) {
        return res.render('auth/login', {
            title: 'Inloggen',
            currentPage: 'login',
            error: 'Verkeerde gebruikersnaam of wachtwoord.'
        });
    }

    // Login gelukt
    // Je wordt onthouden dat je ingelogd bent
    req.session!.user = {
        userId: gebruiker._id!.toString(),
        username: gebruiker.username,
        role: gebruiker.role
    };

    res.redirect('/');
});

// Registratie pagina tonen
router.get('/register', omleidenAlsIngelogd, (req: Request, res: Response) => {
    res.render('auth/register', {
        title: 'Registreren',
        currentPage: 'register',
        error: null,
        success: null
    });
});


router.post('/register', omleidenAlsIngelogd, async (req: Request, res: Response) => {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        return res.render('auth/register', {
            title: 'Registreren',
            currentPage: 'register',
            error: 'Vul alle velden in.',
            success: null
        });
    }

    if (password !== confirmPassword) {
        return res.render('auth/register', {
            title: 'Registreren',
            currentPage: 'register',
            error: 'Wachtwoorden komen niet overeen.',
            success: null
        });
    }

    if (password.length < 6) {
        return res.render('auth/register', {
            title: 'Registreren',
            currentPage: 'register',
            error: 'Wachtwoord moet minstens 6 tekens lang zijn.',
            success: null
        });
    }

    const nieuweGebruiker = await authService.maakGebruikerAan(username, password, 'USER');

    if (!nieuweGebruiker) {
        return res.render('auth/register', {
            title: 'Registreren',
            currentPage: 'register',
            error: 'Gebruikersnaam bestaat al of is ongeldig.',
            success: null
        });
    }

    res.render('auth/register', {
        title: 'Registreren',
        currentPage: 'register',
        error: null,
        success: 'Account aangemaakt! Je kunt nu inloggen.'
    });
});

router.post('/logout', (req: Request, res: Response) => {
    req.session?.destroy((err) => {
        if (err) {
            console.error('Fout bij uitloggen:', err);
        }
        res.redirect('/auth/login');
    });
});

export default router;