export type QueueStatus = "queued" | "synced" | "conflict";

export interface SyncItem {
  id: string;
  type: "trip" | "sos" | "preference";
  payload: unknown;
  status: QueueStatus;
}

const queue: SyncItem[] = [];

export function enqueue(type: SyncItem["type"], payload: unknown): SyncItem {
  const item: SyncItem = {
    id: `sync_${Date.now()}_${queue.length}`,
    type,
    payload,
    status: "queued",
  };
  queue.push(item);
  return item;
}

export function processQueue(online: boolean): SyncItem[] {
  if (!online) return queue.filter((i) => i.status === "queued");
  for (const item of queue) {
    if (item.status === "queued") item.status = "synced";
  }
  return [...queue];
}

export function pendingCount(): number {
  return queue.filter((i) => i.status === "queued").length;
}
