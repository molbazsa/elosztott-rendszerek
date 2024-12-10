export class TaskInterface {
  constructor() {
    this.fields = {
      "id": null,
      "title": null,
      "description": null,
      "assigned_user_id": null,
      "status": null,
    }
  }

  render() {}
  accept(visitor) {}
}

export default class Task extends TaskInterface {
  constructor(taskJSON) {
    super();

    this.fields = {
      id: taskJSON.id,
      ...taskJSON.task,
    };
  }

  render() {
    return {
      style: {},
    };
  }

  accept(visitor) {
    visitor.visit(this);
  }
}
