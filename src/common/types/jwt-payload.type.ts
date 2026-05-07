export type JwtPayload = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone:  string | null;
    createdAt: Date;
    updatedAt: Date;
};