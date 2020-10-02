const io = require('socket.io')();
const Lobby = require('../classes/Lobby');

const ACTIONS = [
    'JOIN',
    'LEAVE',
    'KILL',
    'COLOR_CHANGE',
    'FORCE_UPDATE',
    'DISCONNECT',
    'EXILE'
]

const STATE_MAP = {
    LOBBY: Lobby.PHASE.INTERMISSION,
    TASKS: Lobby.PHASE.WORKING,
    DISCUSSION: Lobby.PHASE.MEETING,
    MENU: Lobby.PHASE.INTERMISSION
}

const STATES = [
    'LOBBY',
    'TASKS',
    'DISCUSSION',
    'MENU'
]

const COLORS = [
    'Red',
    'Blue',
    'Green',
    'Pink',
    'Orange',
    'Yellow',
    'Black',
    'White',
    'Purple',
    'Brown',
    'Cyan',
    'Lime'
]

io.on('connection', client => {
    client.on('connect', connectCode => {{
        Lobby.findByConnectCode(connectCode)
            .then(async lobby => {
                if (!lobby) throw new Error(`No matching lobby for connect code: ${connectCode}`)
                client.connectCode = connectCode;
                await lobby.updateAutomationConnection(true);
                console.log(`SocketIO: Connected code: ${connectCode}`);
            })
            .catch(error => console.error(error));
    }});

    client.on('state', index => {
        const state = STATES[index]
        const targetPhase = STATE_MAP[state];

        // Get the lobby
        const { connectCode } = client;
        Lobby.findByConnectCode(connectCode)
            .then(async lobby => {
                if (!lobby) return;
                console.log(`SocketIO: State update for ${connectCode}:`, state);

                // Handle the menu state differently, by deleting the room.
                if (state === 'MENU') delete lobby.room;

                if (lobby.phase === targetPhase) return;
                await lobby.transition(targetPhase);
            })
            .catch(error => console.error(error));
    });

    client.on('player', data => {
        // Get the lobby
        const { connectCode } = client;
        const {Action, Name, IsDead, Disconnected, Color} = JSON.parse(data);

        // Ignore nameless updates.
        if (!Name) return;

        Lobby.findByConnectCode(connectCode)
            .then(async lobby => {
                if (!lobby) return;

                // Post an update.
                const update = {
                    action: ACTIONS[Action],
                    name: Name,
                    color: COLORS[Color],
                    dead: Boolean(IsDead),
                    disconnected: Boolean(Disconnected)
                }
                console.log(`SocketIO: Player update for ${connectCode}:`, update);
                
                // Process the action
                switch(update.action){
                    case 'JOIN':
                    case 'COLOR_CHANGE':
                        // For a JOIN or COLOR_CHANGE action, add/update the player
                        await lobby.amongUsJoin(update);
                        break;
                    case 'LEAVE':
                    case 'DISCONNECT':
                        // For a LEAVE or DISCONNECT, remove the player.
                        // TODO Handle disconnects differently?
                        await lobby.amongUsLeave(update);
                        break;
                    case 'KILL':
                        await lobby.amongUsKill(update);
                        break;
                    case 'EXILE':
                        await lobby.amongUsExile(update);
                        break;
                    case 'FORCE_UPDATE':
                        await lobby.amongUsForceUpdate(update);
                        break
                    default:
                        throw new Error(`Unknown Action value: ${Action}`);
                }
                
            })
            .catch(error => console.error(error));
    });

    client.on('disconnect', () => {
        const { connectCode } = client;
        Lobby.findByConnectCode(connectCode)
            .then(async lobby => {
                if (!lobby) return;
                console.log(`SocketIO: Disconnected code: ${connectCode}`);
                await lobby.updateAutomationConnection(false);
            })
            .catch(error => console.error(error));
    });
});

// TODO Make port configurable
io.listen(8123);

module.exports = io;
