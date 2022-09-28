import converter from '@q42philips/hue-color-converter';
import fetch from 'node-fetch';

export const getNanoLeafEffect = async (api) => {
    const res = await fetch(`${api}/effects/effectsList`);
    const data = await res.json();
    return data;
};

export const setNanoLeafEffect = async (api, effect, brightness) => {
    const data = await fetch(`${api}/effects`, {
        method: 'PUT',
        body: JSON.stringify({
            select: effect,
        }),
    });
    const data1 = await fetch(`${api}/state`, {
        method: 'PUT',
        body: JSON.stringify({ brightness: { value: brightness } }),
    });
    return data.status === 204 && data1.status === 204;
};

export const setHueLights = async (api, light1, light2) => {
    await fetch(api + '/' + '1' + '/state', {
        method: 'PUT',
        body: JSON.stringify({ on: true }),
    });
    await fetch(api + '/' + '2' + '/state', {
        method: 'PUT',
        body: JSON.stringify({ on: true }),
    });
    const resp = await fetch(api + '/2/state', {
        method: 'PUT',
        body: JSON.stringify({
            xy: converter.calculateXY(
                light2[0],
                light2[1],
                light2[2],
                'LCT010'
            ),
            bri: light2[3],
        }),
    });

    const data = await resp.json();

    if (!data[0] || !data[0].success || !data[1] || !data[1].success) {
        return false;
    }

    const res = await fetch(api + '/1/state', {
        method: 'PUT',
        body: JSON.stringify({
            xy: converter.calculateXY(
                light1[0],
                light1[1],
                light1[2],
                'LCT010'
            ),
            bri: light1[3],
        }),
    });
    const hue1 = await res.json();

    if (!hue1[0] || !hue1[0].success || !hue1[1] || !hue1[1].success) {
        return false;
    }
    return true;
};
