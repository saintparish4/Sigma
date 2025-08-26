export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
    error?: string; 
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number; 
    };
}

// Error Handling
export interface ApiError {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, any>; 
}

export interface ValidationError {
    field: string;
    message: string;
    code: string; 
}
