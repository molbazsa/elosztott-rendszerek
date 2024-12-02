import SortStrategy from './SortStrategy';

class SortByAssignedUser extends SortStrategy {
  sort(tasks) {
    return tasks.slice().sort((a, b) => a.fields.assigned_user_id.localeCompare(b.fields.assigned_user_id));
  }
}

export default SortByAssignedUser;
