# Tajweed Audio Practice

## Scope
- Keep the Quran Teacher layout, Quran text, Tajweed colors, Hifz mode, and existing word-level recitation check unchanged.
- Extend only the existing Tajweed rule sheet for **Madd** and **Ghunnah**.

## Implementation
- Add a standalone browser audio-practice module with a replaceable analyzer interface for future Tajweed AI.
- Let users play the existing correct ayah recitation, record and stop their attempt, play it back, and try again.
- Preserve the selected highlighted fragment and rule while recording.
- Do not estimate or score Madd/Ghunnah from generic browser audio. After recording, report that advanced Tajweed analysis requires an audio AI model, because reliable rule-segment timing and nasal-sound isolation are unavailable in standard browser APIs.
- Other Tajweed rules retain their current Listen and Practice actions.

## Validation
- Verify Madd and Ghunnah highlights open the new controls on real ayahs.
- Verify recording lifecycle and fallback message, plus Listen, playback, and Try Again.
- Recheck existing word mistake detection entry, Hifz mode, selection, Quran marks, and a clean build.
