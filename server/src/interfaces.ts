import { Stats } from "fs";
import { ObjectId } from "mongodb"

export interface UserLog {
    _id?: ObjectId,
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
    owner?: string;
}