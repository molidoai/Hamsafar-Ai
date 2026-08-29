export interface LocalNotice {
  id: string;
  type: "safety" | "trip" | "sos" | "system";
  title: string;
  body: string;
  createdAt: string;
}

const notices: LocalNotice[] = [];

export function pushNotice(type: LocalNotice["type"], title: string, body: string): LocalNotice {
  const notice: LocalNotice = {
    id: `nt_${Date.now()}_${notices.length}`,
    type,
    title,
    body,
    createdAt: new Date().toISOString(),
  };
  notices.unshift(notice);
  return notice;
}

export function listNotices(): LocalNotice[] {
  return [...notices];
}
