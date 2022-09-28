import fetch from 'node-fetch';

export default async (cache, setIsOn, nanoLeafAPI, smolLeafAPI, hueAPI) => {
    await fetch(hueAPI + '/' + '1' + '/state', {
        method: 'PUT',
        body: JSON.stringify({ on: !cache }),
    });
    await fetch(hueAPI + '/' + '2' + '/state', {
        method: 'PUT',
        body: JSON.stringify({ on: !cache }),
    });
    await fetch(`${nanoLeafAPI}/state`, {
        method: 'PUT',
        body: JSON.stringify({ on: { value: !cache } }),
    });
    await fetch(`${smolLeafAPI}/state`, {
        method: 'PUT',
        body: JSON.stringify({ on: { value: !cache } }),
    });
    setIsOn(!cache);
};
