global.WebSocket = require("isomorphic-ws");
import { Game } from "@gathertown/gather-game-client";

interface GatherTownCredentials {
    api_key: string,
    space_id: string
}

export interface GatherTownStatus {
    message: string | null,
    emoji: string | null
}

export class GatherTownClient {
    private game;
    private credentials;

    constructor(credentials: GatherTownCredentials) {
        this.credentials = credentials
        this.game = new Game(this.credentials.space_id, () => Promise.resolve({ apiKey: this.credentials.api_key }));
        this.game.connect();
        this.game.subscribeToConnection((connected) => console.log("connected?", connected));
    }

    update_status(status: GatherTownStatus) {
        this.game.sendAction({
            $case: "setEmojiStatus",
            setEmojiStatus: {
                emojiStatus: status.emoji || ""
            },
        });
        this.game.sendAction({
            $case: "setTextStatus",
            setTextStatus: {
                textStatus: status.message || "",
            },
        });
    }
}