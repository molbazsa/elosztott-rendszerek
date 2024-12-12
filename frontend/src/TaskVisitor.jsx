import { PriorityTask, FrozenTask } from "./TaskPriority";

export class TaskVisitor {
  visit(task) {
    throw new Error("Method 'visit(task)' must be implemented.");
  }

  getAnalytics() {
    throw new Error("Method 'getAnalytics()' must be implemented.");
  }
}

export class TaskStatusVisitor extends TaskVisitor {
  constructor() {
    super();
    this.statusCounts = {
      to_do: 0,
      in_progress: 0,
      done: 0,
    };
  }

  visit(task) {
    if (task.fields.status in this.statusCounts) {
      this.statusCounts[task.fields.status]++;
    }
  }

  getAnalytics() {
    return this.statusCounts;
  }
}

export class PriorityTaskVisitor extends TaskVisitor {
  constructor() {
    super();
    this.priorityCount = 0;
  }

  visit(task) {
    if (task instanceof PriorityTask) {
      this.priorityCount++;
    }
  }

  getAnalytics() {
    return {
      priorityCount: this.priorityCount,
    };
  }
}

export class FrozenTaskVisitor extends TaskVisitor {
  constructor() {
    super();
    this.frozenCount = 0;
  }

  visit(task) {
    if (task instanceof FrozenTask) {
      this.frozenCount++;
    }
  }

  getAnalytics() {
    return {
      frozenCount: this.frozenCount,
    }
  }
}

export class TaskAnalyticsVisitor extends TaskVisitor {
  constructor() {
    super();

    this.count = 0;

    this.visitors = new Map();

    this.visitors.set("status", new TaskStatusVisitor());
    this.visitors.set("priority", new PriorityTaskVisitor());
    this.visitors.set("frozen", new FrozenTaskVisitor());
  }

  visit(task) {
    this.count++;
    this.visitors.forEach((visitor) => visitor.visit(task));
  }

  getAnalytics() {
    const analytics = {
      taskCount: this.count,
    };

    this.visitors.forEach((visitor, visitorName) => {
      analytics[visitorName] = visitor.getAnalytics();
    });

    return analytics;
  }
}
