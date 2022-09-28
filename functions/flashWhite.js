import fetch from 'node-fetch';

export const flashNanoLeaf = async (api) => {
    let data = JSON.stringify({ on: { value: false } });
    fetch(api + '/state', { body: data, method: 'PUT' }).then(() => {
        data = JSON.stringify({ on: { value: true } });
        setTimeout(() => {
            fetch(api + '/state', { body: data, method: 'PUT' }).catch(
                console.error
            );
        }, 2000);
    });
};

export const flashHue = async (api) => {
    const lights = ['1', '2'];
    lights.forEach((light) => {
        fetch(api + '/' + light + '/state', {
            method: 'PUT',
            body: JSON.stringify({
                on: false,
            }),
        }).then(() => {
            setTimeout(async () => {
                await fetch(api + '/' + light + '/state', {
                    method: 'PUT',
                    body: JSON.stringify({
                        on: true,
                    }),
                });
            }, 2000);
        });
    });
    return true;
};
