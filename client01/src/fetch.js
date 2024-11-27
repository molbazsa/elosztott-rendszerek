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

    return await fetch("http://localhost:9000/api/tasks", requestOptions)
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

    return await fetch("http://localhost:9000/api/tasks", requestOptions)
        .then((res) => res.ok ? res.json() : res);
}

async function readTasks() {
    return await fetch("http://localhost:9000/api/tasks")
        .then((res) => res.ok ? res.json() : res);
}

async function readTasks1To2() {
    return await fetch("http://localhost:9000/api/tasks?offset=1&limit=2")
        .then((res) => res.ok ? res.json() : res);
}

async function readTaskById(id) {
    return await fetch(`http://localhost:9000/api/tasks/${id}`)
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

    return await fetch(`http://localhost:9000/api/tasks/${id}`, requestOptions)
        .then((res) => res.ok ? res.json() : res);
}
