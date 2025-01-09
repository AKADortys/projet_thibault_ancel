import 'express';

declare module 'express' {
  export interface Request {
    user?: any; // Typage optionnel pour `user`
  }
}
