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

    return await fetch(`http://localhost:9000/api/tasks`, requestOptions)
        .then((res) => res.ok ? res.json() : res);
}
