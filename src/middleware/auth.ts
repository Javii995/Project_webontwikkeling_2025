import { Request, Response, NextFunction } from 'express';

// Zorgt dat alleen ingelogde gebruikers bij bepaalde pagina's kunnen
export const vereistInloggen = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// Voor login en register pagina's - als je al ingelogd bent hoef je daar niet te zijn en word je doorgestuurd naar andere pagina
export const omleidenAlsIngelogd = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
};

// Alleen admins mogen dingen doen zoals karakters bewerken
export const vereistAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/auth/login');
    }

    // kijken of het admin is
    if (req.session.user.role !== 'ADMIN') {
        return res.status(403).render('error', {
            title: 'Geen toegang',
            error: 'Je hebt geen admin rechten voor deze actie.',
            currentPage: ''
        });
    }

    next();
};

export const voegGebruikerToeAanViews = (req: Request, res: Response, next: NextFunction) => {
    res.locals.user = req.session?.user || null;
    next();
};