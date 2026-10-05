# Fix Quranic Unicode mark rendering

## Changes
- Load a Quran-compatible Arabic font with broad Quranic annotation-mark coverage.
- Apply that font only to Quran text in Quran Teacher, including Tajweed-highlighted spans and the full-surah view.
- Preserve the Quran source text, all Unicode marks, Tajweed colors, and existing interactions unchanged.

## Verification
- Open Quran Teacher and inspect Al-Baqarah 19 plus several other marked ayahs at desktop and mobile widths.
- Confirm no empty square glyphs appear and Tajweed taps still open the rule details with Listen and Practice.
- Confirm the app builds without errors.
