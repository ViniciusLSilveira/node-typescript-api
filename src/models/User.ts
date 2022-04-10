import { Document, Model, model, Schema } from 'mongoose';

export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
}

interface UserModel extends Omit<User, '_id'>, Document {}

const user = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            transform: (_, ret): void => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__V;
            },
        },
    }
);

export const User: Model<UserModel> = model('User', user);
