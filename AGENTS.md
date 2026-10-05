# Project Architecture Rules

- Render Quran text with the dedicated `font-quran` semantic font token so Quranic Unicode annotation marks retain compatible glyph coverage.
- Route Tajweed audio evaluation through the replaceable analyzer interface; browser-only recording must never invent timing accuracy or scores.