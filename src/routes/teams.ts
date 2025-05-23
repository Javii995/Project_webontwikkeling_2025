import express, { Request, Response, Router } from 'express';
import { Team, Character, TeamQuery } from '../interfaces';
import { dbService } from '../services/database';

const router: Router = express.Router();

// Teams overview page
router.get('/', async (req: Request<{}, {}, {}, TeamQuery>, res: Response) => {
    try {
        const sortBy: string = req.query.sortBy || '';
        const sortOrder: 'asc' | 'desc' = req.query.sortOrder || 'asc';

        let teams: Team[];

        if (sortBy) {
            teams = await dbService.getTeamsSorted(sortBy, sortOrder);
        } else {
            teams = await dbService.getAllTeams();
        }

        res.render('teams/index', {
            title: 'Marvel Teams',
            teams,
            currentPage: 'teams',
            sortBy: sortBy,
            sortOrder: sortOrder
        });
    } catch (error) {
        console.error('Error in teams route:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: 'Failed to load teams',
            currentPage: 'teams'
        });
    }
});

// Team detail page
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const team: Team | null = await dbService.getTeamById(req.params.id);

        if (!team) {
            return res.status(404).render('error', {
                title: 'Team Not Found',
                error: 'The requested team could not be found.',
                currentPage: 'teams'
            });
        }

        // Find all characters belonging to this team
        const teamMembers: Character[] = await dbService.getCharactersByTeamId(team.id);

        res.render('teams/detail', {
            title: `${team.name} - Team Details`,
            team,
            teamMembers,
            currentPage: 'teams'
        });
    } catch (error) {
        console.error('Error in team detail route:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: 'Failed to load team details',
            currentPage: 'teams'
        });
    }
});

export default router;