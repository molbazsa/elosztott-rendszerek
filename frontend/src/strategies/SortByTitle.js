import SortStrategy from './SortStrategy';

class SortByTitle extends SortStrategy {
  sort(tasks) {
    return tasks.slice().sort((a, b) => a.task.title.localeCompare(b.task.title));
  }
}

export default SortByTitle;
