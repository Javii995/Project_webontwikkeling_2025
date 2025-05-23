export interface Team {
    id: string;
    name: string;
    leader: string;
    headquarters: string;
    teamLogoUrl: string;
    foundedYear: number;
    motto: string;
}

export interface Character {
    id: string;
    name: string;
    realName: string;
    description: string;
    age: number;
    isActive: boolean;
    birthDate: string;
    imageUrl: string;
    affiliation: string;
    powers: string[];
    firstAppearance: string;
    team: Team;
}

// Query interfaces for type safety
export interface CharacterQuery {
    search?: string;
    sortBy?: keyof Character | 'team';
    sortOrder?: 'asc' | 'desc';
}

export interface TeamQuery {
    sortBy?: keyof Team;
    sortOrder?: 'asc' | 'desc';
}

// Response interfaces
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}