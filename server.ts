import {GATHERTOWN_API_KEY, GATHERTOWN_SPACE_ID, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET} from "./secrets";
import express, {Request, Response} from 'express';
import {stringify} from 'querystring';
import {randomBytes} from "crypto";
import {ILogObj, Logger} from "tslog";

import {SpotifyClient} from "./spotify_client";
import {GatherTownClient} from "./gathertown-client";
import open = require("open");

const gatherTown = new GatherTownClient({api_key: GATHERTOWN_API_KEY, space_id: GATHERTOWN_SPACE_ID})

const log: Logger<ILogObj> = new Logger({type: "json"});

const app = express();
const port = 3000;
const spotify_auth_callback_path = "callback"
let host = `localhost`;
let protocol = `http`;
const redirect_uri = `${protocol}://${host}:${port}/${spotify_auth_callback_path}`

const spotify_client = new SpotifyClient({
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET
})

app.get('/login', (req: Request, res: Response) => {
    const state = randomBytes(16).toString('hex');
    const scope = 'user-read-currently-playing';

    res.redirect('https://accounts.spotify.com/authorize?' +
        stringify({
            response_type: 'code',
            client_id: SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
})

app.get('/callback', async (req: Request, res: Response) => {
    const url = `http://localhost:${port}${req.url}`
    const parsedUrl = new URL(url)
    const challenge_code = parsedUrl.searchParams.get('code')

    log.debug("fetching refresh token")
    if (!challenge_code) {
        const error = Error("Bad challenge code")
        return res.status(400).send(error.message)
    }

    await spotify_client.fetchRefreshToken(challenge_code);

    // TODO: refresh access token when necessary
    // TODO: move loop into background
    res.status(200).send('Authorised!')
    setInterval(async () => {
        try {
            const playing = await spotify_client.currentTrack();

            if (playing === null) {
                await gatherTown.update_status({emoji: null, message: null})
            }
            else {
                await gatherTown.update_status({
                    emoji: "🎶",
                    message: `Listening to ${playing.name} - ${playing.artist}`
                });
            }
        }
        catch (error) {
            if (error) {
                throw error.message
            }
        }
    }, 20000);
});

app.listen(port, async () => {
    log.debug(`Server running at http://localhost:${port}/`);
    open("http://localhost:3000/login")
})
