import { Stats } from "fs";

export interface UserLog {
    email: string;
    password: string;
    salt: string;
}

export interface ResponseObject {
    objects: object[];
    page: number;
    total: number;
}

export interface ImageInterface {
    id: string;
    path: string;
    metadata: Stats;
}