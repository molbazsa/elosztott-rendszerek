import { TaskInterface } from "./Task";

// Decorator Base Class
export class TaskPriorityDecorator extends TaskInterface {
  constructor(task) {
    super();

    this.decoratedTask = task;
    this.fields = task.fields;
  }

  render() {
    return this.decoratedTask.render();
  }

  accept(visitor) {
    visitor.visit(this);
  }

  undecorated() {
    return this.decoratedTask;
  }
}

// Priority Task Decorator
export class PriorityTask extends TaskPriorityDecorator {
  render() {
    const baseRender = this.decoratedTask.render()
    return {
      ...baseRender,
      style: { ...baseRender.style, border: '2px solid red' },
    };
  }
}

// Frozen Task Decorator
export class FrozenTask extends TaskPriorityDecorator {
  render() {
    const baseRender = this.decoratedTask.render();
    return {
      ...baseRender,
      style: { ...baseRender.style, color: 'lightgrey' },
    };
  }
}
