# Music Analysis

[Try it now!](https://hlorenzi.github.io/musicanalysis/)

This is a tool for composing or analyzing music.

It's currently a proof-of-concept, and, as such, it is
very unoptimized performance-wise.

Some editing tools are currently keyboard-only.  
The keys `1` to `7` input scale-aware pitches.  
Use the arrow keys to move notes and the cursor around.  
Move the cursor while holding down `Shift` to select an interval of notes.  
Move a note while holding down `Ctrl` to change its duration.  
Press `Enter` to unselect all notes.  
Use the `Alt` key for faster steps while moving stuff around.  
You can also click on elements with the mouse to select them.  
Also, range-select elements by dragging the mouse.  

In the future, it should support:

- [ ] Full roman numeral harmony analysis
- [ ] Save/Load from Dropbox, URL, or local files
- [ ] Import/Export from MIDI, tracker, and other formats
- [ ] Song parameter changes, such as tempo
- [ ] Note pitch bending
- [ ] Multiple tracks and instruments
- [ ] Note/Track parameter changes, such as note velocity

Uses piano samples from <http://theremin.music.uiowa.edu/MISpiano.html>.

In order for audio samples to load properly when developing locally,
set up a local HTTP server, such as `python3 -m http.server 80`.