import fetch from 'node-fetch';

export default async (
    direction,
    oldBrightness,
    setBrightness,
    nanoLeafAPI,
    smolLeafAPI,
    hueAPI
) => {
    let newBrightness = oldBrightness + direction * 10;
    if (newBrightness > 100 || newBrightness < 0) {
        newBrightness = newBrightness > 50 ? 100 : 0;
    }
    await fetch(hueAPI + '/' + '1' + '/state', {
        method: 'PUT',
        body: JSON.stringify({
            on: newBrightness > 0,
            bri: Math.round(newBrightness * 2.54),
        }),
    });

    await fetch(hueAPI + '/' + '2' + '/state', {
        method: 'PUT',
        body: JSON.stringify({
            on: newBrightness > 0,
            bri: Math.round(newBrightness * 2.54),
        }),
    });

    await fetch(`${nanoLeafAPI}/state`, {
        method: 'PUT',
        body: JSON.stringify({
            on: { value: newBrightness > 0 },
            brightness: { value: newBrightness, duration: 0 },
        }),
    });

    await fetch(`${smolLeafAPI}/state`, {
        method: 'PUT',
        body: JSON.stringify({
            on: { value: newBrightness > 0 },
            brightness: { value: newBrightness, duration: 0 },
        }),
    });

    setBrightness(newBrightness);
};
