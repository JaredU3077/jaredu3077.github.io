# Mechvibes Keyboard Sound Review & Improvement Plan

## 1. Current Implementation Overview
- Uses a sound pack defined in `config.json` and a single audio file (`sound.ogg`).
- Keypresses are mapped to sound "sprites" (audio segments) using a mapping of keyCodes to time offsets in the audio file.
- Mapping is handled in `js/utils/mechvibes.js`:
  - `playKeySound(key)` converts the key to a keyCode and tries to play the corresponding sound sprite.
  - Mapping from key name to keyCode is handled by `getKeyCode(key)`.
  - Sound sprites are defined in the `defines` object in `config.json`, where each key is a stringified keyCode.

## 2. Observed Issues
- Some keys (e.g., the letter **b**) do not produce any sound.
- This is likely because the keyCode for 'b' (66) is not present in the `defines` mapping in `config.json`.
- Other keys may also be missing or incorrectly mapped.

## 3. Root Cause Analysis
- The `defines` object in `config.json` does not have entries for all keyCodes (e.g., 66 for 'b').
- When a key is pressed, if its keyCode is not present in `defines`, no sound is played.
- The mapping is not comprehensive for all standard keyboard keys.

## 4. Plan to Fix and Improve

### A. Audit and Expand Key Mapping
- Step 1: Generate a full list of standard keyboard keyCodes (A-Z, 0-9, symbols, etc.).
- Step 2: Compare this list to the keys present in `defines` in `config.json`.
- Step 3: For any missing keyCodes, add new entries to `defines` and assign them to an existing or new sound sprite.
  - If unique sounds are not available for every key, use a default sound for missing keys.

### B. Add Fallback for Missing Keys in Code
- Update `MechvibesPlayer.playKeySound(key)` to:
  - Check if the keyCode exists in `defines`.
  - If not, play a default sound (e.g., the sound for 'a' or another common key).

### C. Improve Debugging and Logging
- Add console warnings when a key is pressed that has no sound mapping.
- Optionally, provide a UI or log to show which keys are missing mappings.

### D. Optional: UI Feedback
- Optionally, visually indicate when a key is pressed but no sound is mapped.

## 5. Example: How to Add a Fallback in Code
```js
// In MechvibesPlayer.playKeySound(key)
const keyCode = this.getKeyCode(key);
const soundId = `${keyCode}`;
if (!this.currentPack.defines[soundId]) {
    // Fallback: use 'a' key sound or another default
    console.warn(`No sound mapping for key "${key}" (keyCode ${keyCode}), using fallback.`);
    this.playSound('65', this.volume); // 65 = 'a'
} else {
    this.playSound(soundId, this.volume);
}
```

## 6. Action Items
- [ ] Audit and expand the `defines` mapping in `config.json` to cover all standard keys.
- [ ] Add fallback logic in the code for unmapped keys.
- [ ] Add logging for missing key mappings.
- [ ] (Optional) Add UI feedback for unmapped keys.

## 7. References
- [MechvibesPlayer implementation](js/utils/mechvibes.js)
- [Sound pack config](config.json)
- [KeyCode reference](https://keycode.info/)

**This plan will ensure all keys produce a sound and improve the user experience for Mechvibes keyboard sounds.** 