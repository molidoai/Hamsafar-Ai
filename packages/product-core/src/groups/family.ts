export type GroupRole = "owner" | "adult" | "child" | "member";

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  members: { userId: string; role: GroupRole }[];
}

const groups = new Map<string, Group>();

export function createGroup(ownerId: string, name: string): Group {
  const group: Group = {
    id: `grp_${Date.now()}`,
    name,
    ownerId,
    members: [{ userId: ownerId, role: "owner" }],
  };
  groups.set(group.id, group);
  return group;
}

export function addMember(groupId: string, actorId: string, userId: string, role: GroupRole): Group {
  const group = groups.get(groupId);
  if (!group) throw new Error("GROUP_NOT_FOUND");
  const actor = group.members.find((m) => m.userId === actorId);
  if (!actor || (actor.role !== "owner" && actor.role !== "adult")) {
    throw new Error("GROUP_PERMISSION_DENIED");
  }
  if (role === "owner") throw new Error("OWNER_ROLE_LOCKED");
  group.members.push({ userId, role });
  return group;
}

export function canShareLocation(group: Group, userId: string, consent: boolean): boolean {
  if (!consent) return false;
  return group.members.some((m) => m.userId === userId);
}
