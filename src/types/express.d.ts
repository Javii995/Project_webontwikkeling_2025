import 'express-session';
import { UserSession } from '../interfaces';

declare module 'express-session' {
    interface SessionData {
        user?: UserSession;
    }
}

declare global {
    namespace Express {
        interface Locals {
            user?: UserSession | null;
        }
    }
}