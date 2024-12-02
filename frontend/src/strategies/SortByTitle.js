import SortStrategy from './SortStrategy';

class SortByTitle extends SortStrategy {
  sort(tasks) {
    return tasks.slice().sort((a, b) => a.fields.title.localeCompare(b.fields.title));
  }
}

export default SortByTitle;
