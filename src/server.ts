import './util/module-alias';
import { Application } from 'express';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { Server } from '@overnightjs/core';
import * as database from '@src/database';
import { ForecastController } from './controllers/forecast';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/users';
import bodyParser from 'body-parser';
import logger from './logger';
import apiSchema from './api.schema.json';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

export class SetupServer extends Server {
    constructor(private port = 3333) {
        super();
    }

    public async init(): Promise<void> {
        this.setupExpress();
        await this.docsSetup();
        this.setupControllers();
        await this.databaseSetup();
    }

    public async close(): Promise<void> {
        await database.close();
    }

    public getApp(): Application {
        return this.app;
    }

    public start(): void {
        this.app.listen(this.port, () => {
            logger.info(`Server listening on port: ${this.port}`);
        });
    }

    private setupExpress(): void {
        this.app.use(bodyParser.json());
        this.app.use(
            expressPino({
                logger,
            })
        );
        this.app.use(
            cors({
                origin: '*',
            })
        );
    }

    private async docsSetup(): Promise<void> {
        this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
        this.app.use(
            OpenApiValidator.middleware({
                apiSpec: apiSchema as OpenAPIV3.Document,
                validateRequests: false,
                validateResponses: false,
            })
        );
    }

    private setupControllers(): void {
        const forecastController = new ForecastController();
        const beachesController = new BeachesController();
        const userController = new UsersController();
        this.addControllers([
            forecastController,
            beachesController,
            userController,
        ]);
    }

    private async databaseSetup(): Promise<void> {
        await database.connect();
    }
}
