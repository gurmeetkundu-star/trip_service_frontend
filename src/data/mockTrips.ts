import type { Trip } from '../types';

export const mockTrips: Trip[] = [
    {
        "id": 2,
        "expected_start_time": 1234,
        "actual_start_time": 1234,
        "status": "CREATED",
        "stops": [
            {
                "id": 3,
                "trip_id": 2,
                "name": "Warehouse A",
                "sequence": 1,
                "tasks": [
                    {
                        "id": 4,
                        "stop_id": 3,
                        "task_type": "LOAD",
                        "sequence": 1,
                        "task_name": "LOAD"
                    },
                    {
                        "id": 5,
                        "stop_id": 3,
                        "task_type": "VERIFY",
                        "sequence": 2,
                        "task_name": "VERIFY"
                    }
                ]
            },
            {
                "id": 4,
                "trip_id": 2,
                "name": "Customer B",
                "sequence": 2,
                "tasks": [
                    {
                        "id": 6,
                        "stop_id": 4,
                        "task_type": "UNLOAD",
                        "sequence": 1,
                        "task_name": "UNLOAD"
                    }
                ]
            }
        ]
    },
    {
        "id": 1,
        "expected_start_time": "1234",
        "actual_start_time": "1234",
        "status": "CREATED",
        "stops": [
            {
                "id": 1,
                "trip_id": 1,
                "name": "Warehouse A",
                "sequence": 1,
                "tasks": [
                    {
                        "id": 1,
                        "stop_id": 1,
                        "task_type": "LOAD",
                        "sequence": 1,
                        "task_name": ""
                    },
                    {
                        "id": 2,
                        "stop_id": 1,
                        "task_type": "VERIFY",
                        "sequence": 2,
                        "task_name": ""
                    }
                ]
            },
            {
                "id": 2,
                "trip_id": 1,
                "name": "Customer B",
                "sequence": 2,
                "tasks": [
                    {
                        "id": 3,
                        "stop_id": 2,
                        "task_type": "UNLOAD",
                        "sequence": 1,
                        "task_name": ""
                    }
                ]
            }
        ]
    }
];
