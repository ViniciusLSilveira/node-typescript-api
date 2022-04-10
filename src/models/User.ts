import AuthService from '@src/services/auth';
import mongoose, { Document, Model, model, Schema } from 'mongoose';

export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
}

export enum CUSTOM_VALIDATION {
    DUPLICATED = 'DUPLICATED',
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

user.path('email').validate(
    async (email: string) => {
        const emailCount = await mongoose.models.User.countDocuments({ email });
        return !emailCount;
    },
    'already exists in the database.',
    CUSTOM_VALIDATION.DUPLICATED
);

user.pre<UserModel>('save', async function (): Promise<void> {
    if (!this.password || !this.isModified('password')) return;

    try {
        const hashedPassword = await AuthService.hashPassword(this.password);
        this.password = hashedPassword;
    } catch (error) {
        console.error(`Error hashing the password for the user ${this.name}`);
    }
});

export const User: Model<UserModel> = model('User', user);
