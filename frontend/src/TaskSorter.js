class TaskSorter {
    constructor(strategy) {
      this.strategy = strategy;
    }
  
    setStrategy(strategy) {
      this.strategy = strategy;
    }
  
    sort(tasks) {
      return this.strategy.sort(tasks);
    }
  }
  
  export default TaskSorter;