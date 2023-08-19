import Updater from "spotify-oauth-refresher";
import {ILogObj, Logger} from "tslog";
import TrackObjectFull = SpotifyApi.TrackObjectFull;
import CurrentlyPlayingObject = SpotifyApi.CurrentlyPlayingObject;

export interface SpotifyCredentials {
    client_id: string;
    client_secret: string;
}

export interface SpotifyRefreshTokenResponse {
    refresh_token: string;
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface SpotifyTrack {
    name: string,
    artist: string
}

export class SpotifyClient {
    private api;
    private credentials;
    private logger;

    constructor(credentials: SpotifyCredentials, logger: Logger<ILogObj> = new Logger({type: "json"})) {
        this.logger = logger;
        this.credentials = credentials;
        this.api = new Updater({
            clientId: credentials.client_id,
            clientSecret: credentials.client_secret
        });
    }

    async fetchRefreshToken(challenge_code: string): Promise<SpotifyRefreshTokenResponse | Error> {
        try {
            const res = await this.api.request({
                url: "https://accounts.spotify.com/api/token",
                method: "post",
                data: {
                    client_id: this.credentials.client_id,
                    client_secret: this.credentials.client_secret,
                    grant_type: "authorization_code",
                    code: challenge_code,
                    redirect_uri: "http://localhost:3000/callback",
                    authType: "bearer"
                }
            });

            const data: SpotifyRefreshTokenResponse = res.data;
            if (data) {
                this.api.setAccessToken(data.access_token)
                this.api.setRefreshToken(data.refresh_token)
                this.logger.debug("Retreived tokens")
                return {
                    refresh_token: data.refresh_token,
                    access_token: data.access_token,
                    token_type: data.token_type,
                    expires_in: data.expires_in,
                    scope: data.scope
                }
            }
            else return new Error("Something went wrong")

        }
        catch(error) {
            this.logger.debug(error)
            return error.message
        }
    }

    private isTrackObject(object: CurrentlyPlayingObject): boolean {
        return object.hasOwnProperty('currently_playing_type') && object.currently_playing_type === 'track'
    }

    // TODO: Make this return a currently_playing type
    async currentTrack(): Promise<SpotifyTrack | null> {
        try {
            const res = await this.api.request({
                url: "https://api.spotify.com/v1/me/player/currently-playing",
                method: "get",
                authType: "bearer",
            });

            const currently_playing_object: SpotifyApi.CurrentlyPlayingObject = res.data
            if (currently_playing_object && this.isTrackObject(currently_playing_object)) {
                const track: SpotifyApi.TrackObjectFull = <TrackObjectFull>currently_playing_object.item
                this.logger.debug("got the track")
                this.logger.debug(currently_playing_object)
                return {
                    name: track.name,
                    artist: track.artists[0].name
                };
            }
            return null

        } catch(error) {
            this.logger.error(error)
            return error
        }
    }
}