export interface PatchTripData {
    tripCode: string;
    tripStartTime: string;
    sourceLocation: string;
    destinationLocation: string;
    status: string;
}

export interface PatchContent {
    message?: string;
    data: PatchTripData[];
}

export interface Patch {
    id: number;
    type: string;
    content: PatchContent;
}

const BASE_URL = import.meta.env.VITE_API_URL;

export const patchService = {
    getPatches: async (): Promise<Patch[]> => {
        const response = await fetch(`${BASE_URL}/api/patch`);
        if (!response.ok) {
            throw new Error('Failed to fetch patches');
        }
        return response.json();
    }
};
