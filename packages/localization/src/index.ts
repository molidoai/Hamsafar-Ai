const dictionaries: Record<string, Record<string, string>> = {
  fa: {
    app_name: "مولیدو همسفر",
    trip_create: "ساخت سفر",
    sos: "اضطراری",
    offline: "حالت آفلاین",
  },
  en: {
    app_name: "MOLIDO HAMSAFAR",
    trip_create: "Create trip",
    sos: "Emergency",
    offline: "Offline mode",
  },
  ar: {
    app_name: "موليدو همسفر",
    trip_create: "إنشاء رحلة",
    sos: "طوارئ",
    offline: "وضع دون اتصال",
  },
};

export function t(lang: string, key: string): string {
  return dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
}

export function supportedLanguages(): string[] {
  return Object.keys(dictionaries);
}
