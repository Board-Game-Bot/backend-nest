export enum ResponseResult {
    Success = 'Success',
    FormatError = 'FormatError',
    AuthorizationError = 'AuthorizationError',
    InternalError = 'InternalError',
    FrontEndError = 'FrontEndError',
}

interface WithRequestId {
    RequestId: string;
}

export interface SuccessResponse<T = any> extends WithRequestId {
    ResultType: ResponseResult.Success;
    Data: T;
}

export interface FormatErrorResponse extends WithRequestId {
    ResultType: ResponseResult.FormatError;
    FormatMessage: Record<string, string>;
}

export interface AuthorizationErrorResponse extends WithRequestId {
    ResultType: ResponseResult.AuthorizationError;
}

export interface InternalErrorResponse extends WithRequestId {
    ResultType: ResponseResult.InternalError;
    // 不暴露给前端
    ErrorMessage?: string;
}

export interface FrontEndErrorResponse {
    ResultType: ResponseResult.FrontEndError;
    Error: any;
}

export type ErrorResponse =
    | FormatErrorResponse
    | AuthorizationErrorResponse
    | InternalErrorResponse
    | FrontEndErrorResponse;

export type Response =
    | SuccessResponse
    | ErrorResponse;

