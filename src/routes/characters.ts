import express, { Request, Response } from 'express';
import { dbService } from '../services/database';
import { vereistAdmin } from '../middleware/auth';

const router = express.Router();

// Overzichtspagina met alle karakters in een tabel
router.get('/', async (req: Request, res: Response) => {
    const zoekterm = req.query.search as string || '';
    const sorteerVeld = req.query.sortBy as string || '';
    const sorteerRichting = req.query.sortOrder as 'asc' | 'desc' || 'asc';

    let karakters;

    try {
        if (zoekterm) {
            // Als er gezocht wordt, eerst zoeken en dan eventueel sorteren
            karakters = await dbService.zoekKaracters(zoekterm);
            if (sorteerVeld) {
                // Zoekresultaten sorteren - dit doen we in het geheugen omdat het al gefilterde data is
                karakters = sorteerKaracters(karakters, sorteerVeld, sorteerRichting);
            }
        } else if (sorteerVeld) {
            karakters = await dbService.haalKaraktersOpGesorteerd(sorteerVeld, sorteerRichting);
        } else {
            karakters = await dbService.haalAlleKaraktersOp();
        }

        res.render('characters/index', {
            title: 'Marvel Karakters',
            characters: karakters,
            currentPage: 'characters',
            searchQuery: zoekterm,
            sortBy: sorteerVeld,
            sortOrder: sorteerRichting
        });
    } catch (error) {
        console.error('Fout bij laden karakters:', error);
        res.status(500).render('error', {
            title: 'Fout',
            error: 'Kon karakters niet laden',
            currentPage: 'characters'
        });
    }
});

// Laat alle info zien en andere teamleden
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const karakter = await dbService.vindKarakterOpId(req.params.id);

        if (!karakter) {
            return res.status(404).render('error', {
                title: 'Karakter niet gevonden',
                error: 'Dit karakter bestaat niet.',
                currentPage: 'characters'
            });
        }

        // filteren het huidige karakter eruit zodat je jezelf niet ziet
        const teamGenoten = await dbService.haalKaraktersOpVanTeam(karakter.team.id);
        const andereTeamleden = teamGenoten.filter(lid => lid.id !== karakter.id);

        res.render('characters/detail', {
            title: `${karakter.name} - Details`,
            character: karakter,
            teamMembers: andereTeamleden,
            currentPage: 'characters'
        });
    } catch (error) {
        console.error('Fout bij laden karakter:', error);
        res.status(500).render('error', {
            title: 'Fout',
            error: 'Kon karakter details niet laden',
            currentPage: 'characters'
        });
    }
});

router.get('/:id/edit', vereistAdmin, async (req: Request, res: Response) => {
    try {
        const karakter = await dbService.vindKarakterOpId(req.params.id);
        const teams = await dbService.haalAlleTeamsOp(); // voor de dropdown

        if (!karakter) {
            return res.status(404).render('error', {
                title: 'Karakter niet gevonden',
                error: 'Dit karakter bestaat niet.',
                currentPage: 'characters'
            });
        }

        res.render('characters/edit', {
            title: `${karakter.name} bewerken`,
            character: karakter,
            teams,
            currentPage: 'characters'
        });
    } catch (error) {
        console.error('Fout bij laden bewerkingsformulier:', error);
        res.status(500).render('error', {
            title: 'Fout',
            error: 'Kon bewerkingsformulier niet laden',
            currentPage: 'characters'
        });
    }
});

// Dit gebeurt als een admin het formulier indient
router.post('/:id/edit', vereistAdmin, async (req: Request, res: Response) => {
    try {
        const { name, realName, age, isActive, affiliation } = req.body;

        const updates = {
            name: name?.trim(),
            realName: realName?.trim(),
            age: parseInt(age),
            isActive: isActive === 'true',
            affiliation: affiliation?.trim()
        };

        Object.keys(updates).forEach(key => {
            if (!updates[key as keyof typeof updates]) {
                delete updates[key as keyof typeof updates];
            }
        });

        const gelukt = await dbService.werkKarakterBij(req.params.id, updates);

        if (gelukt) {
            res.redirect(`/characters/${req.params.id}`);
        } else {
            throw new Error('Update mislukt');
        }
    } catch (error) {
        console.error('Fout bij karakter bijwerken:', error);
        res.status(500).render('error', {
            title: 'Fout',
            error: 'Kon karakter niet bijwerken',
            currentPage: 'characters'
        });
    }
});

// Dit wordt gebruikt als we als we zoekresultaten moeten sorteren
function sorteerKaracters(karakters: any[], sorteerVeld: string, sorteerRichting: 'asc' | 'desc') {
    return karakters.sort((a, b) => {
        let waardeA = sorteerVeld === 'team' ? a.team.name : a[sorteerVeld];
        let waardeB = sorteerVeld === 'team' ? b.team.name : b[sorteerVeld];

        if (typeof waardeA === 'string') {
            waardeA = waardeA.toLowerCase();
            waardeB = waardeB.toLowerCase();
        }

        if (sorteerRichting === 'desc') {
            return waardeA < waardeB ? 1 : -1;
        }
        return waardeA > waardeB ? 1 : -1;
    });
}

export default router;