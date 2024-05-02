export enum SocketRequest {
    JoinMatchRequest = 'JoinMatchRequest',
    JoinRoomRequest = 'JoinRoomRequest',
    MakeRoomRequest = 'MakeRoomRequest',
    LeaveMatchRequest = 'LeaveMatchRequest',
    ReadyRequest = 'ReadyRequest',
}

export enum SocketResponse {
    JoinMatchErrorResponse = 'JoinMatchErrorResponse',
    JoinRoomErrorResponse = 'JoinRoomErrorResponse',
    MakeRoomResponse = 'MakeRoomResponse',
    MakeRoomErrorResponse = 'MakeRoomErrorResponse',
    SyncRoomResponse = 'SyncRoomResponse',
}