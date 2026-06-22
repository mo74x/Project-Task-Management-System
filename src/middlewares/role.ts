import { Request, Response, NextFunction } from 'express';

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // @ts-ignore
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ 
        message: 'Forbidden: You do not have the required permissions to perform this action.' 
      });
      return;
    }

    next();
  };
};