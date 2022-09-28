import { hueConnect, nanoLeafConnect } from './functions/connect.js';
import { flashNanoLeaf, flashHue } from './functions/flashWhite.js';
import { setNanoLeafEffect, setHueLights } from './functions/apiFunctions.js';
import updateBrightness from './functions/updateBrightness.js';
import setOnOff from './functions/setOnOff.js';
import effects from './effects.js';
import chalk from 'chalk';
import * as rl from 'readline';
const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
});
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import HID from 'node-hid';
import moveEffectByOne from './functions/moveEffectByOne.js';
const devices = HID.devices();
let lastTurn = Date.now();
const KEYBOARD_NAME = 'Sofle';
const KEYBOARD_USAGE_ID = 0x61;
const KEYBOARD_USAGE_PAGE = 0xff60;
let currentEffect = 'mint';
let keyboard = null;
let brightnessCache = 40;
let isOn = true;

const nanoLeafAPI = `http://${process.env.NANOLEAFIP}:16021/api/v1/${process.env.NANOLEAFAUTH}`;

const smallNanoLeafAPI = `http://${process.env.SMALLNANOLEAFIP}:16021/api/v1/${process.env.SMALLNANOLEAFAUTH}`;

const hueAPI = `http://${process.env.HUEIP}/api/${process.env.HUEAUTH}/lights`;

const setup = async () => {
    await nanoLeafConnect(nanoLeafAPI);
    await nanoLeafConnect(smallNanoLeafAPI);
    await hueConnect(hueAPI);
    await flashHue(hueAPI);
    await flashNanoLeaf(nanoLeafAPI);
    await flashNanoLeaf(smallNanoLeafAPI);

    initiateConnection();
};

async function main() {
    readline.question(
        chalk.bold.blueBright('What effect would you like to activate?\n'),
        async (input) => {
            const effectName = input.split(', ')[0];
            const brightInput = parseInt(input.split(',')[1]);
            const brightness = brightInput ? brightInput : brightnessCache;
            const hueBrightness = Math.round(brightness * 2.54);

            if (['quit', 'q'].includes(effectName)) {
                return process.exit(0);
            }
            for (const effect of effects) {
                if (effect.names.includes(effectName)) {
                    const nano = await setNanoLeafEffect(
                        nanoLeafAPI,
                        effect.nanoLeaf,
                        brightness
                    );
                    const smolNano = await setNanoLeafEffect(
                        smallNanoLeafAPI,
                        effect.smolLeaf,
                        brightness
                    );
                    const hue = await setHueLights(
                        hueAPI,
                        [...effect.hue1, hueBrightness],
                        [...effect.hue2, hueBrightness]
                    );

                    if (!nano && !hue && !smolNano) {
                        console.error('No lights responded');
                    } else if (!hue) {
                        console.error('Hue lights did not respond');
                    } else if (!nano || !smolNano) {
                        console.error('Nano lights did not respond');
                    } else {
                        console.log(
                            chalk.bold.magentaBright('Effect changed.')
                        );
                    }
                }
            }
            main().catch(console.error);
        }
    );
}

setup()
    .then(async () => {
        console.log('setup complete');
        main().catch(console.error);
    })
    .catch(console.error);

const initiateConnection = () => {
    console.log(chalk.bold.yellow('Searching for keyboard...'));
    for (const d of devices) {
        if (
            d.product === KEYBOARD_NAME &&
            d.usage === KEYBOARD_USAGE_ID &&
            d.usagePage === KEYBOARD_USAGE_PAGE
        ) {
            // Create a new connection and store it as the keyboard
            try {
                keyboard = new HID.HID(d.path);
            } catch (e) {
                console.log(chalk.bold.red('Could not connect keyboard'));
                return;
            }

            console.log(chalk.bold.green('Keyboard connection established.'));
            keyboard.on('error', (err) => {
                if (err.message === 'could not read from HID device') {
                    keyboard = null;
                    console.log(chalk`{bold.red Keyboard connection failed.}`);
                    reEstablishConnection().catch(console.error);
                } else {
                    console.error(err);
                }
            });
            // Listen for data from the keyboard which indicates the screen to show
            keyboard.on('data', (e) => {
                // Check that the data is a valid screen index and update the current one
                if (lastTurn > Date.now() - 100) {
                    return;
                }
                lastTurn = Date.now();
                if ([14, 15].includes(e[0])) {
                    brightnessCache = brightnessCache ? brightnessCache : 50;
                    moveEffectByOne(
                        e[0] === 14 ? -1 : 1,
                        brightnessCache,
                        currentEffect,
                        (x) => (currentEffect = x),
                        nanoLeafAPI,
                        smallNanoLeafAPI,
                        hueAPI
                    );
                } else if ([12, 13].includes(e[0])) {
                    updateBrightness(
                        e[0] === 12 ? -1 : 1,
                        brightnessCache,
                        (x) => {
                            brightnessCache = x;
                        },
                        nanoLeafAPI,
                        smallNanoLeafAPI,
                        hueAPI
                    );
                } else if (e[0] === 10) {
                    setOnOff(
                        isOn,
                        (x) => {
                            isOn = x;
                        },
                        nanoLeafAPI,
                        smallNanoLeafAPI,
                        hueAPI
                    );
                }
            });

            break;
        }
    }
};

const reEstablishConnection = async () => {
    while (!keyboard) {
        await sleep(60000);
        initiateConnection();
    }
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
