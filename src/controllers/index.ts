import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/User';
import ApiError, { APIError } from '@src/util/errors/api-error';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
    protected sendCreateUpdateErrorResponse(
        res: Response,
        error: mongoose.Error.ValidationError | Error
    ): void {
        if (error instanceof mongoose.Error.ValidationError) {
            const { code, errorString } = this.handleClientErrors(error);
            res.status(code).send(
                ApiError.format({ code, message: errorString })
            );
        } else {
            logger.error(error);
            res.status(500).send(
                ApiError.format({ code: 500, message: 'Something went wrong' })
            );
        }
    }

    protected sendErrorResponse(res: Response, apiError: APIError): Response {
        return res.status(apiError.code).send(ApiError.format(apiError));
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
            return { code: 400, errorString: error.message };
        }
    }
}
