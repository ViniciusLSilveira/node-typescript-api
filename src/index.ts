import { SetupServer } from './server';
import config from 'config';

enum ExitStatus {
    Failure = 1,
    Success = 0,
}

process.on('unhandledRejection', (reason, promise) => {
    // logger.error(
    //   `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
    // );
    console.error(
        `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
    );
    // lets throw the error and let the uncaughtException handle below handle it
    throw reason;
});

process.on('uncaughtException', (error) => {
    // logger.error(`App exiting due to an uncaught exception: ${error}`);
    console.error(`App exiting due to an uncaught exception: ${error}`);
    process.exit(ExitStatus.Failure);
});

(async (): Promise<void> => {
    try {
        const server = new SetupServer(config.get('App.port'));
        await server.init();
        server.start();

        const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
        for (const exitSignal of exitSignals) {
            process.on(exitSignal, async () => {
                try {
                    await server.close();
                    console.info(`App exited with success`);
                    //   logger.info(`App exited with success`);
                    process.exit(ExitStatus.Success);
                } catch (error) {
                    console.error(`App exited with error: ${error}`);
                    //   logger.error(`App exited with error: ${error}`);
                    process.exit(ExitStatus.Failure);
                }
            });
        }
    } catch (error) {
        console.error(`App exited with error: ${error}`);
        // logger.error(`App exited with error: ${error}`);
        process.exit(ExitStatus.Failure);
    }
})();
