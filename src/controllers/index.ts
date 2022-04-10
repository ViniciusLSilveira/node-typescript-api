import { CUSTOM_VALIDATION } from '@src/models/User';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
    protected sendCreateUpdateErrorResponse(
        res: Response,
        error: mongoose.Error.ValidationError | Error
    ): void {
        if (error instanceof mongoose.Error.ValidationError) {
            const { code, errorString } = this.handleClientErrors(error);
            res.status(code).send({ code, error: errorString });
        } else {
            res.status(500).send({ code: 500, error: 'Something went wrong' });
        }
    }

    private handleClientErrors(error: mongoose.Error.ValidationError): {
        code: number;
        errorString: string;
    } {
        const duplicatedKindError = Object.values(error.errors).filter(
            (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
        );
        if (duplicatedKindError.length > 0) {
            return { code: 409, errorString: error.message };
        } else {
            return { code: 422, errorString: error.message };
        }
    }
}
