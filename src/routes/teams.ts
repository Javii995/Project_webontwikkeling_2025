import express, { Request, Response } from 'express';
import { dbService } from '../services/database';

const router = express.Router();

// Overzichtspagina met alle teams
router.get('/', async (req: Request, res: Response) => {
    const sorteerVeld = req.query.sortBy as string || '';
    const sorteerRichting = req.query.sortOrder as 'asc' | 'desc' || 'asc';

    let teams;

    try {
        if (sorteerVeld) {
            teams = await dbService.haalTeamsOpGesorteerd(sorteerVeld, sorteerRichting);
        } else {
            teams = await dbService.haalAlleTeamsOp();
        }

        res.render('teams/index', {
            title: 'Marvel Teams',
            teams,
            currentPage: 'teams',
            sortBy: sorteerVeld,
            sortOrder: sorteerRichting
        });
    } catch (error) {
        console.error('Fout bij laden teams:', error);
        res.status(500).render('error', {
            title: 'Fout',
            error: 'Kon teams niet laden',
            currentPage: 'teams'
        });
    }
});

// Laat team info zien en alle teamleden
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const team = await dbService.vindTeamOpId(req.params.id);

        if (!team) {
            return res.status(404).render('error', {
                title: 'Team niet gevonden',
                error: 'Dit team bestaat niet.',
                currentPage: 'teams'
            });
        }

        // Alle karakters van dit team ophalen om te laten zien
        const teamleden = await dbService.haalKaraktersOpVanTeam(team.id);

        res.render('teams/detail', {
            title: `${team.name} - Team Details`,
            team,
            teamMembers: teamleden,
            currentPage: 'teams'
        });
    } catch (error) {
        console.error('Fout bij laden team:', error);
        res.status(500).render('error', {
            title: 'Fout',
            error: 'Kon team details niet laden',
            currentPage: 'teams'
        });
    }
});

export default router;