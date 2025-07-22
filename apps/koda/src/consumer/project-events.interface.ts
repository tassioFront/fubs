export interface ProjectCreatedEvent {
  id: string;
  workspaceId: string;
}

export interface WorkspaceCreatedEvent {
  id: string;
  ownerId: string;
}

export interface WorkspaceMemberAddedEvent {
  workspaceId: string;
  userId: string;
}
