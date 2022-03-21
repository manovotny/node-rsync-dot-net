import {execaCommand} from 'execa';
import Listr from 'listr';
import {pathExists} from 'path-exists';

import {generateRsyncCommand} from './utils.js';

export default async ({destination, excludes, sources, verbose}) => {
    const commands = [];
    const notFound = [];

    await Promise.all(
        sources.map(async (source) => {
            const exists = await pathExists(source);

            if (exists) {
                const command = generateRsyncCommand({
                    destination,
                    excludes,
                    source,
                });

                commands.push({
                    task: () => execaCommand(command, {shell: true}),
                    title: source,
                });
            } else {
                notFound.push(source);
            }
        })
    );

    const tasks = new Listr(commands, {
        renderer: verbose ? 'verbose' : 'default',
    });

    console.log(`Backing up...`);

    tasks
        .run()
        .then(() => {
            console.log('Backup complete! 🎉');

            if (notFound.length) {
                console.log('Sources not found:', notFound);
            }
        })
        .catch((error) => {
            console.error(error);
        });
};
