import { ObjectId } from 'mongodb';

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

export interface CharacterQuery {
    search?: string;
    sortBy?: keyof Character | 'team';
    sortOrder?: 'asc' | 'desc';
}

export interface TeamQuery {
    sortBy?: keyof Team;
    sortOrder?: 'asc' | 'desc';
}

// User types for database
export interface UserDB {
    _id?: ObjectId;
    username: string;
    password: string;
    role: 'ADMIN' | 'USER';
    createdAt?: Date;
}

// User types for application
export interface User {
    _id?: string;
    username: string;
    password: string;
    role: 'ADMIN' | 'USER';
    createdAt?: Date;
}

export interface UserSession {
    userId: string;
    username: string;
    role: 'ADMIN' | 'USER';
}

// Extend Express session
declare module 'express-session' {
    interface SessionData {
        user?: UserSession;
    }
}