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
