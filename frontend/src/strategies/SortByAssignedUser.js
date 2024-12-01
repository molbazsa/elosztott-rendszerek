import SortStrategy from './SortStrategy';

class SortByAssignedUser extends SortStrategy {
  sort(tasks) {
    return tasks.slice().sort((a, b) => a.task.assigned_user_id.localeCompare(b.task.assigned_user_id));
  }
}

export default SortByAssignedUser;
