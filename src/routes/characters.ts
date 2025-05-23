import express, { Request, Response, Router } from 'express';
import { Character, Team, CharacterQuery } from '../interfaces';
import { dbService } from '../services/database';

const router: Router = express.Router();

// Overview page with table
router.get('/', async (req: Request<{}, {}, {}, CharacterQuery>, res: Response) => {
    try {
        const searchQuery: string = req.query.search || '';
        const sortBy: string = req.query.sortBy || '';
        const sortOrder: 'asc' | 'desc' = req.query.sortOrder || 'asc';

        console.log('🔍 Search query received:', searchQuery);
        console.log('📊 Sort by:', sortBy, 'Order:', sortOrder);

        let characters: Character[];

        // Get characters with search and sort
        if (searchQuery) {
            // Search in database
            characters = await dbService.searchCharacters(searchQuery);
            console.log('📊 Characters found by search:', characters.length);

            // Apply sorting to search results if needed
            if (sortBy) {
                characters = await sortCharacters(characters, sortBy, sortOrder);
            }
        } else if (sortBy) {
            // Get sorted characters from database
            characters = await dbService.getCharactersSorted(sortBy, sortOrder);
        } else {
            // Get all characters
            characters = await dbService.getAllCharacters();
        }

        console.log('📊 Final character count:', characters.length);

        res.render('characters/index', {
            title: 'Marvel Characters',
            characters,
            currentPage: 'characters',
            searchQuery: searchQuery,
            sortBy: sortBy,
            sortOrder: sortOrder
        });
    } catch (error) {
        console.error('Error in characters route:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: 'Failed to load characters',
            currentPage: 'characters'
        });
    }
});

// Detail page for specific character
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const character: Character | null = await dbService.getCharacterById(req.params.id);

        if (!character) {
            return res.status(404).render('error', {
                title: 'Character Not Found',
                error: 'The requested character could not be found.',
                currentPage: 'characters'
            });
        }

        // Find other characters in the same team
        const teamMembers: Character[] = await dbService.getCharactersByTeamId(character.team.id);
        const otherTeamMembers = teamMembers.filter(char => char.id !== character.id);

        res.render('characters/detail', {
            title: `${character.name} - Character Details`,
            character,
            teamMembers: otherTeamMembers,
            currentPage: 'characters'
        });
    } catch (error) {
        console.error('Error in character detail route:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: 'Failed to load character details',
            currentPage: 'characters'
        });
    }
});

// Edit form page
router.get('/:id/edit', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const character: Character | null = await dbService.getCharacterById(req.params.id);
        const teams: any[] = await dbService.getAllTeams();

        if (!character) {
            return res.status(404).render('error', {
                title: 'Character Not Found',
                error: 'The requested character could not be found.',
                currentPage: 'characters'
            });
        }

        res.render('characters/edit', {
            title: `Edit ${character.name}`,
            character,
            teams,
            currentPage: 'characters'
        });
    } catch (error) {
        console.error('Error loading edit form:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: 'Failed to load edit form',
            currentPage: 'characters'
        });
    }
});

// Handle edit form submission
router.post('/:id/edit', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { name, realName, age, isActive, affiliation } = req.body;

        const updates: Partial<Character> = {
            name: name?.trim(),
            realName: realName?.trim(),
            age: parseInt(age) || 0,
            isActive: isActive === 'true',
            affiliation: affiliation?.trim()
        };

        // Remove undefined/empty values
        Object.keys(updates).forEach(key => {
            if (updates[key as keyof Character] === undefined || updates[key as keyof Character] === '') {
                delete updates[key as keyof Character];
            }
        });

        const success = await dbService.updateCharacter(req.params.id, updates);

        if (success) {
            res.redirect(`/characters/${req.params.id}?updated=true`);
        } else {
            throw new Error('Failed to update character');
        }
    } catch (error) {
        console.error('Error updating character:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: 'Failed to update character',
            currentPage: 'characters'
        });
    }
});

// Helper function to sort characters in memory (for search results)
async function sortCharacters(characters: Character[], sortBy: string, sortOrder: 'asc' | 'desc'): Promise<Character[]> {
    return characters.sort((a: Character, b: Character) => {
        let aVal: any = a[sortBy as keyof Character];
        let bVal: any = b[sortBy as keyof Character];

        // Handle nested team name sorting
        if (sortBy === 'team') {
            aVal = a.team.name;
            bVal = b.team.name;
        }

        // Handle string comparison
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (sortOrder === 'desc') {
            return aVal < bVal ? 1 : -1;
        } else {
            return aVal > bVal ? 1 : -1;
        }
    });
}

export default router;