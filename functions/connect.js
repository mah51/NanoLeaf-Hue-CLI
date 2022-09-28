import chalk from 'chalk';
import fetch from 'node-fetch';

export async function nanoLeafConnect(api) {
    const response = await fetch(api);
    const data = await response.json();

    if (!data) {
        return new Error('Nanoleaf failure to connect');
    }

    console.log(
        chalk.bold(
            chalk.magentaBright('Connected to Nanoleaf - ') +
                // @ts-ignore
                chalk.blueBright(data.name)
        )
    );
    console.log(
        chalk.magenta('Possible effects - ') +
            chalk.greenBright(
                // @ts-ignore
                data.effects.effectsList.join(chalk.blueBright(', '))
            )
    );
    console.log(
        chalk.magenta('Current effect - ') +
            // @ts-ignore
            chalk.blueBright(data.effects.select) +
            '\n'
    );
    return data;
}

export async function hueConnect(api) {
    const response = await fetch(api);
    const data = await response.json();
    if (!data) {
        return new Error('Hue failure to connect');
    }
    console.log(
        chalk.bold(
            chalk.magentaBright('Connected to Hue - ') +
                chalk.blueBright(
                    Object.keys(data)
                        .map((key) => data[key].name)
                        .join(chalk.greenBright(', '))
                )
        )
    );
    return data;
}
