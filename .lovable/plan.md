# پلانی تەواوکردنی هەموو تایبەتمەندییەکان

هەموو داواکارییەکان بە یەک پەرە جێبەجێ دەکرێن. لابردنی بەشی **جۆری فۆنت** (وەک وێنەکە).

## ١. لابردن
- لابردنی کارتی "جۆری فۆنت" لە SettingsView (`src/routes/index.tsx`).
- پاککردنەوەی `FontFamily`, `FONT_FAMILY_CSS`, `FONT_FAMILY_LABEL` لە `src/lib/settings.ts`.

## ٢. قورئان و دەنگ
- **هاوکاتی هایلایت**: ئایەتی ئێستا بە ڕەنگی پڕی primary + auto-scroll بۆ ناوەڕاستی screen.
- **مۆدی ئۆفلاین**: داگرتنی سوورەت بۆ IndexedDB (`idb-keyval`)؛ دوگمەی ⬇ + indicator.
- **بەردەوامبوون لە دوایین خوێندنەوە**: پاشەکەوتی `{surah, ayah}` لە localStorage + کارت لە Home.
- **خێرایی لێدان**: 0.5/0.75/1/1.25/1.5/2 (`audio.playbackRate`).
- **کاژێری خەو**: 5/10/15/30/60 خولەک یان کۆتایی سوورەت.
- **ئایەتی ڕۆژ**: لیستی پێشدابەشکراو، هەڵبژاردن بەپێی dayOfYear، کارت لە Home.

## ٣. ئامار
- `src/lib/stats.ts`: کاتی گوێگرتن، Streak ڕۆژانە، % ـی پێشکەوتنی خەتم.
- کارتی ئامار لە Home.

## ٤. نۆتیفیکەیشن
- `src/lib/notifications.ts`: Notification API + setTimeout بۆ هەر نوێژێک ڕۆژانە.
- تۆگڵ لە Settings بۆ هەر نوێژێک بەجیا + بیرخستنەوەی زیکری بەیانی/ئێواران.

## ٥. ڕۆژی هەینی
- `src/components/FridayPanel.tsx`: لینکی سوورەتی کەهف، چێکلستی سوننەت، ژمێرەری سەڵاوات.
- دیار دەبێت لە Home تەنیا ڕۆژی هەینی.

## ٦. UX/UI
- **Framer Motion**: گواستنەوەی نەرم لەنێوان تابەکان (`AnimatePresence`).
- **تێمی Sepia**: لە `src/styles.css` (`.theme-sepia`) + تۆگڵ.
- **مۆدی منداڵان**: تێمی ڕەنگاوڕەنگ + فۆنتی گەورەتر + emoji.
- **گەڕانی بابەتی**: API ـی `api.alquran.cloud/v1/search/{q}/all/ar` + لینک بۆ ئایەت.
- **کۆنترۆڵی Lock-screen**: `navigator.mediaSession` metadata + handlers.
- **هاوبەشیکردنی ئایەت**: `html-to-image` + `navigator.share` بۆ دروستکردنی وێنە.
- **وەرگێڕانی دەنگی**: `speechSynthesis` بۆ خوێندنەوەی وەرگێڕانی کوردی.

## ٧. تەکنیکی
- **RTL**: دڵنیاکردنەوەی `dir` لە `__root.tsx` بۆ زمانە RTL ـەکان.
- **Cloud Sync**: چالاککردنی Lovable Cloud — تەیبڵی `user_settings`, `user_stats`, `feedback` + RLS + GRANTs + server functions.
- **Lazy-loading**: `React.lazy` بۆ KhatmTracker, QiblaCompass, TafsirSheet.
- **فۆڕمی پێشنیار**: لە Settings → دەنێردرێت بۆ `feedback` تەیبڵ.

## فایلە نوێیەکان (≈١٢)
`stats.ts`, `notifications.ts`, `verse-of-day.ts`, `offline-audio.ts`, `share-image.ts`,
`SleepTimer.tsx`, `PlaybackSpeed.tsx`, `FridayPanel.tsx`, `VerseOfDay.tsx`,
`StatsCards.tsx`, `ThematicSearch.tsx`, `FeedbackForm.tsx`

## نوێکردنەوەکان
`src/routes/index.tsx`, `src/routes/__root.tsx`, `src/lib/settings.ts`, `src/lib/i18n.ts`, `src/styles.css`

## پاکێجە نوێیەکان
`framer-motion`, `idb-keyval`, `html-to-image`

## Backend (Lovable Cloud)
چالاککردن + migration بۆ ٣ تەیبڵ + ٣ server function (`getUserData`, `saveUserData`, `submitFeedback`).

دوای پەسەندکردن، هەمووی بە یەک گەڕان جێبەجێ دەکەم.
