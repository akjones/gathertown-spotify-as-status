# Gather mod: set status to Spotify

a Gather mod which sets your status to your currently playing track on spotify

check out the [websocket API docs](https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063) for more!

This one uses outh to grab Spotify session creds so it'll launch a little server to handle the redirection loop.

## setup

prereq: have NodeJS and npm installed

run `npm install`

put your [Gather API key](https://gather.town/apiKeys), -spaceId, [Spotify API credentials](https://developer.spotify.com/dashboard/applications) in a file named `secrets.ts` like so:

```ts
export const GATHERTOWN_API_KEY = "gathertown-api-key";
export const GATHERTOWN_SPACE_ID = "gatherSpaceId\\gatherSpaceName";
export const SPOTIFY_CLIENT_ID = "spotify-client-id";
export const SPOTIFY_CLIENT_SECRET = "spotify-client-secret";
```

## running

`npm run start`

## further information

- [Gather Websocket API docs](https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063)
- [Ben Wiz: How to create a Spotify refresh token the easy way](https://benwiz.com/blog/create-spotify-refresh-token/)
- [Spotify dev guide: Authorization Code Flow](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/)
- [Matthew Stead's Spotify OAuth Refresher](https://github.com/matievisthekat/spotify-oauth-refresher)