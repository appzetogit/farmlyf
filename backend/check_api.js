import http from 'http';

const fetchUrl = (path) => {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:5000/api/${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    console.log(`\n--- Response for ${path} ---`);
                    console.log(data);
                    resolve();
                } catch (e) { console.error(e); resolve(); }
            });
        }).on('error', (err) => {
            console.error(err);
            resolve();
        });
    });
};

const run = async () => {
    await fetchUrl('categories');
    await fetchUrl('subcategories');
};

run();
