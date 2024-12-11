export function connectToWebSocket(websocketUrl, subscriber) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(websocketUrl);

        socket.onopen = () => {
            console.log("WebSocket connected.");
            resolve(socket);
        };

        socket.onmessage = (event) => {
            const message = event.data;
            console.log("Notification received:", message);
            subscriber.update(message);
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected. Attempting to reconnect...");
            // Reconnect after 3 seconds
            setTimeout(() => connectToWebSocket(websocketUrl, subscriber), 3000);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            reject(error);
        };
    });
}

export class TaskSubscriber {
    static WEBSOCKET_URL = "ws://localhost:9000/ws/notify";

    constructor(onMessageCallback) {
        this.onMessageCallback = onMessageCallback;
        this.connected = false;
    }

    async subscribeWebsocket() {
        if (!this.connected) {
            await connectToWebSocket(TaskSubscriber.WEBSOCKET_URL, this)
                .then(() => {
                    this.connected = true;
                });
        }
    }

    update(message) {
        this.onMessageCallback(message);
    }
}
