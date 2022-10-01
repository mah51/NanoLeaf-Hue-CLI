import chalk from 'chalk';
import effects from '../effects.js';
import { setHueLights, setNanoLeafEffect } from './apiFunctions.js';
export default async function (
    direction,
    brightness,
    currentEffect,
    setCurrentEffect,
    nanoLeafAPI,
    smallNanoLeafAPI,
    hueAPI
) {
    effects.forEach(async (effect, index) => {
        if (effect.names.includes(currentEffect)) {
            const newEffect =
                effects[
                    index + direction === -1
                        ? effects.length - 1
                        : (index + direction) % effects.length
                ];
            const nano = await setNanoLeafEffect(
                nanoLeafAPI,
                newEffect.nanoLeaf,
                brightness
            );
            const smolNano = await setNanoLeafEffect(
                smallNanoLeafAPI,
                newEffect.smolLeaf,
                brightness
            );
            const hue = await setHueLights(
                hueAPI,
                [...newEffect.hue1, brightness],
                [...newEffect.hue2, brightness]
            );
            if (nano && hue && smolNano) {
                console.log(
                    `${chalk.magenta.bold(
                        `Effect changed to ${chalk.red.bold(
                            newEffect.names[0]
                        )} with keyboard`
                    )}`
                );
            }
            setCurrentEffect(newEffect.names[0]);
        }
    });
}
