import { PrismaClient } from "@prisma/client";
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";
import { Request, Response } from "express";

export const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient;
    userId?: number;
    res: Response
}

export const context = ({ req, res }: { req: Request, res: Response }): Context => {
    const token =
        req && req.headers.authorization
            ? decodeAuthHeader(req.headers.authorization)
            : null;

    return {
        prisma,
        userId: token?.userId,
        res
    };
};
