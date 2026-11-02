# Project Architecture Rules

- Render Quran text with the dedicated `font-quran` semantic font token so Quranic Unicode annotation marks retain compatible glyph coverage.
- Route Tajweed audio evaluation through the replaceable analyzer interface; analyzers return measured signal timing or "unreliable", never guessed results or speech-to-text-based judgments.
- Quran Teacher playback uses one event-owned audio controller and cancellable resource prefetch; only natural `ended` advances within the selected Surah, while Stop aborts loads and pause/errors/stale requests cannot start another track. This prevents overlap and unintended Surah rollover.