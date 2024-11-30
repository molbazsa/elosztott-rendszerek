const websocketUrl = "ws://localhost:9000/ws/notify";

let socket;

export function connectToWebSocket(onMessageCallback) {
    socket = new WebSocket(websocketUrl);

    socket.onopen = () => {
        console.log("WebSocket connected.");
    };

    socket.onmessage = (event) => {
        const message = event.data;
        console.log("Notification received:", message);
        if (onMessageCallback) {
            onMessageCallback(message);
        }
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected. Attempting to reconnect...");
        setTimeout(() => connectToWebSocket(onMessageCallback), 3000); // Reconnect after 3 seconds
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}
