const { hueConnect, nanoLeafConnect } = require("./functions/connect");
const { flashNanoLeaf, flashHue } = require("./functions/flashWhite");
const { setNanoLeafEffect, setHueLights } = require("./functions/apiFunctions");
const updateBrightness = require("./functions/updateBrightness");
const setOnOff = require("./functions/setOnOff");
const effects = require("./effects");
const chalk = require("chalk");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
require("dotenv").config();
var HID = require("node-hid");
const moveEffectByOne = require("./functions/moveEffectByOne");
const devices = HID.devices();
let lastTurn = Date.now();
const KEYBOARD_NAME = "Sofle";
const KEYBOARD_USAGE_ID = 0x61;
const KEYBOARD_USAGE_PAGE = 0xff60;
let currentEffect = "mint";
let keyboard = null;
let brightnessCache = 0;
let isOn = true;

const nanoLeafAPI = `http://${process.env.NANOLEAFIP}:16021/api/v1/${process.env.NANOLEAFAUTH}`;

const hueAPI = `http://${process.env.HUEIP}/api/${process.env.HUEAUTH}/lights`;

const setup = async () => {
  await nanoLeafConnect(nanoLeafAPI);
  await hueConnect(hueAPI);
  await flashHue(hueAPI);
  await flashNanoLeaf(nanoLeafAPI);
  initiateConnection();
};

async function main() {
  readline.question(
    chalk.bold.blueBright("What effect would you like to activate?\n"),
    async (input) => {
      const effectName = input.split(", ")[0];
      const brightInput = parseInt(input.split(",")[1]);
      const brightness = brightInput ? brightInput : brightnessCache;
      const hueBrightness = Math.round(brightness * 2.54);

      if (["quit", "q"].includes(effectName)) {
        return process.exit(0);
      }
      for (const effect of effects) {
        if (effect.names.includes(effectName)) {
          const nano = await setNanoLeafEffect(
            nanoLeafAPI,
            effect.nanoLeaf,
            brightness
          );
          const hue = await setHueLights(
            hueAPI,
            [...effect.hue1, hueBrightness],
            [...effect.hue2, hueBrightness]
          );

          if (!nano && !hue) {
            console.error("No lights responded");
          } else if (!hue) {
            console.error("Hue lights did not respond");
          } else if (!nano) {
            console.error("Nano lights did not respond");
          } else {
            console.log(chalk.bold.magentaBright("Effect changed."));
          }
        }
      }
      main().catch(console.error);
    }
  );
}

setup()
  .then(async () => {
    console.log("setup complete");
    main().catch(console.error);
  })
  .catch(console.error);

const initiateConnection = () => {
  console.log(chalk.bold.yellow("Searching for keyboard..."));
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
        console.log(chalk.bold.red("Could not connect keyboard"));
        return;
      }

      console.log(chalk`{bold.green Keyboard connection established.}`);
      keyboard.on("error", (err) => {
        if (err.message === "could not read from HID device") {
          keyboard = null;
          console.log(chalk`{bold.red Keyboard connection failed.}`);
          reEstablishConnection().catch(console.error);
        } else {
          console.error(err);
        }
      });
      // Listen for data from the keyboard which indicates the screen to show
      keyboard.on("data", (e) => {
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
            (x) => (currentEffect = x)
          );
        } else if ([12, 13].includes(e[0])) {
          updateBrightness(
            e[0] === 12 ? -1 : 1,
            brightnessCache,
            (x) => {
              brightnessCache = x;
            },
            nanoLeafAPI,
            hueAPI
          );
        } else if (e[0] === 10) {
          setOnOff(
            isOn,
            (x) => {
              isOn = x;
            },
            nanoLeafAPI,
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
