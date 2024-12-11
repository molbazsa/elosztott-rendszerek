const API_URL = "http://localhost:9000";

async function createTask() {
    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");

    const requestBody = {
        title: "First Task",
        description: "First task",
        assigned_user_id: "abcdef",
        status: "to_do",
    };

    const requestOptions = {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
    };

    return await fetch(`${API_URL}/api/tasks`, requestOptions)
        .then((res) => res.ok ? res.json() : res);
}

async function createTaskPartial() {
    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");

    const requestBody = {
        title: "First Task",
        description: "First task",
        assigned_user_id: "abcdef",
    };

    const requestOptions = {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
    };

    return await fetch(`${API_URL}/api/tasks`, requestOptions)
        .then((res) => res.ok ? res.json() : res);
}

async function readTasks() {
    return await fetch(`${API_URL}/api/tasks`)
        .then((res) => res.ok ? res.json() : res);
}

async function readTasks1To2() {
    return await fetch(`${API_URL}/api/tasks?offset=1&limit=2`)
        .then((res) => res.ok ? res.json() : res);
}

async function readTaskById(id) {
    return await fetch(`${API_URL}/api/tasks/${id}`)
        .then((res) => res.ok ? res.json() : res);
}

async function updateTask(id) {
    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");

    const requestBody = {
        title: "Second Task",
        description: "Second task",
        status: "in_progress",
    };

    const requestOptions = {
        method: "PATCH",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
    };

    return await fetch(`${API_URL}/api/tasks/${id}`, requestOptions)
        .then((res) => res.ok ? res.json() : res);
}

async function undo() {
    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");

    const requestOptions = {
        method: "POST",
        headers: requestHeaders,
    };

    return await fetch(`${API_URL}/api/undo`, requestOptions)
        .then((res) => res.ok ? res.json() : res);
}

async function redo() {
    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");

    const requestOptions = {
        method: "POST",
        headers: requestHeaders,
    };

    return await fetch(`${API_URL}/api/redo`, requestOptions)
        .then((res) => res.ok ? res.json() : res);
}
