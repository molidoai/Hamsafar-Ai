export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

export interface SosEvent {
  id: string;
  userId: string;
  lat?: number;
  lng?: number;
  offline: boolean;
  createdAt: string;
  notifiedContactIds: string[];
}

const contacts = new Map<string, TrustedContact[]>();
const events: SosEvent[] = [];

export function addTrustedContact(userId: string, contact: TrustedContact): void {
  const list = contacts.get(userId) ?? [];
  list.push(contact);
  contacts.set(userId, list);
}

export function triggerSos(userId: string, coords?: { lat: number; lng: number }, offline = false): SosEvent {
  const list = contacts.get(userId) ?? [];
  if (!list.length) throw new Error("NO_TRUSTED_CONTACT");
  const event: SosEvent = {
    id: `sos_${Date.now()}`,
    userId,
    lat: coords?.lat,
    lng: coords?.lng,
    offline,
    createdAt: new Date().toISOString(),
    notifiedContactIds: list.map((c) => c.id),
  };
  events.push(event);
  return event;
}

export function listSosEvents(userId: string): SosEvent[] {
  return events.filter((e) => e.userId === userId);
}
