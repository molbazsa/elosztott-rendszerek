import SortStrategy from './SortStrategy';

class SortByStatus extends SortStrategy {
    sort(tasks) {
      const order = { to_do: 1, in_progress: 2, done: 3 };
      return tasks.slice().sort((a, b) => order[a.fields.status] - order[b.fields.status]);
    }
}

export default SortByStatus;
