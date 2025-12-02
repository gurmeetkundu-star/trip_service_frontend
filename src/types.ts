export interface Task {
  id: number;
  stop_id: number;
  task_type: string;
  sequence: number;
  task_name: string;
}

export interface Stop {
  id: number;
  trip_id: number;
  name: string;
  sequence: number;
  tasks: Task[];
}

export interface Trip {
  id: number;
  expected_start_time: number | string;
  actual_start_time: number | string;
  status: string;
  stops: Stop[];
}
