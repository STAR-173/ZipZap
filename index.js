const express = require('express');
const redis = require('redis');

const app = express();
const client = redis.createClient();

app.get('/:code', (req, res) => {
    const code = req.params.code;
    const authCode = req.query.auth_code;

    if (!authCode || authCode.length !== 6 || isNaN(authCode)) {
        res.status(400).send('Invalid auth code');
    } else {
        client.exists(code, (err, reply) => {
            if (err) {
                res.status(500).send('Internal Server Error');
            } else if (reply === 0) {
                client.set(code, authCode, (err, reply) => {
                    if (err) {
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.send('Page created and auth code set');
                    }
                });
            } else {
                client.get(code, (err, storedAuthCode) => {
                    if (err) {
                        res.status(500).send('Internal Server Error');
                    } else if (authCode === storedAuthCode) {
                        res.send('Authenticated');
                    } else {
                        res.send('Auth Denied');
                    }
                });
            }
        });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
