# Game Chat - Visual Preview

## Collapsed State (Default)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                            ┌──────────┐     │
│                                            │   💬     │ 3   │
│                                            │          │     │
│                                            └──────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
        Floating chat button (bottom-right corner)
        Badge shows unread message count
```

## Expanded State (Active Chat Window)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                  ┌────────────────────────┐ │
│                                  │ Game Chat          ✕   │ │
│                                  ├────────────────────────┤ │
│                                  │ Alice          10:23 AM│ │
│                                  │ Good luck everyone!    │ │
│                                  │                        │ │
│                                  │ Bob            10:24 AM│ │
│                                  │ Let's do this! 🎯      │ │
│                                  │                        │ │
│                                  │ You            10:25 AM│ │
│                                  │ Ready to win!          │ │
│                                  │                        │ │
│                                  │                        │ │
│                                  │                        │ │
│                                  ├────────────────────────┤ │
│                                  │ [Type a message...] 📤 │ │
│                                  └────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Chat Button States

### Idle (No Messages)
```
┌──────────┐
│    💬    │
└──────────┘
```

### With Notifications
```
┌──────────┐
│    💬    │ ⓵
└──────────┘

┌──────────┐
│    💬    │ ⑤
└──────────┘

┌──────────┐
│    💬    │ 9+
└──────────┘
```

### Hover State
```
┌──────────┐
│    💬    │ ← Slightly larger (scale 1.05)
└──────────┘   Glowing shadow
```

## Message Bubbles

### Other Player's Message
```
┌─────────────────────────────────┐
│ Alice              10:23 AM     │
│ ───────────────────────────     │
│ Good luck everyone!             │
└─────────────────────────────────┘
  Background: Gray (gray-700)
  Name: Primary Blue (primary-400)
```

### Your Message
```
┌─────────────────────────────────┐
│ You                10:25 AM     │
│ ───────────────────────────     │
│ Ready to win!                   │
└─────────────────────────────────┘
  Background: Primary Tint (primary-600/20)
  Name: Primary Blue (primary-400)
```

### Long Message (Word Wrap)
```
┌─────────────────────────────────┐
│ Bob                10:30 AM     │
│ ───────────────────────────     │
│ This is a really long message   │
│ that wraps to multiple lines    │
│ automatically when it gets too  │
│ long to fit on one line.        │
└─────────────────────────────────┘
```

## Input Field

### Empty (Send Disabled)
```
┌─────────────────────────────────────────┐
│ [Type a message...]        [Send] ←─────┤
└─────────────────────────────────────────┘
                              Disabled (gray)
```

### With Text (Send Enabled)
```
┌─────────────────────────────────────────┐
│ Hello everyone!            [Send] ←─────┤
└─────────────────────────────────────────┘
                              Enabled (blue)
```

### Character Limit
```
┌─────────────────────────────────────────┐
│ This is my message... (455/500)  [Send] │
└─────────────────────────────────────────┘
```

## Animation Sequence

### Opening Chat
```
Frame 1:  ●  (Chat button)
          ↓
Frame 2:  ◐  (Start expanding)
          ↓
Frame 3:  ◯  (Expanding)
          ↓
Frame 4:  ▭  (Window appears)
          ↓
Frame 5:  ■  (Fully expanded)
```

### New Message Arriving
```
Frame 1: [Existing messages]
         
Frame 2: [Existing messages]
         [New message fades in →]
         
Frame 3: [Existing messages]
         [New message slides up  ]
         
Frame 4: [Existing messages]
         [New message fully visible]
```

### Closing Chat
```
Frame 1:  ■  (Window open)
          ↓
Frame 2:  ▭  (Shrinking)
          ↓
Frame 3:  ◯  (Collapsing)
          ↓
Frame 4:  ◐  (Almost closed)
          ↓
Frame 5:  ●  (Back to button)
```

## Layout Context (Full Game Screen)

```
┌──────────────────────────────────────────────────────────────┐
│  [Game Header - Scores & Info]                               │
├──────────────────────────────────────────────────────────────┤
│  [Turn Indicator]                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                  [Game Board - 10x10 Grid]                   │
│                                                              │
│                                                              │
│                                            ┌──────────────┐  │
│                                            │  Game Chat   │  │
│                                            │              │  │
│                                            │  Messages... │  │
│                                            │              │  │
│                                            │  [Input]     │  │
│                                            └──────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  [Card Hand - Player's Cards]                                │
└──────────────────────────────────────────────────────────────┘
    Chat positioned in bottom-right, above card hand
```

## Color Scheme

```
Chat Button:         #2563eb (primary-600)
Chat Button Hover:   #1d4ed8 (primary-700)
Window Background:   #1f2937 (gray-800)
Header Border:       #374151 (gray-700)
Own Message BG:      #2563eb33 (primary-600/20)
Other Message BG:    #374151 (gray-700)
Player Name:         #60a5fa (primary-400)
Timestamp:           #6b7280 (gray-500)
Message Text:        #e5e7eb (gray-200)
Input Background:    #374151 (gray-700)
Input Border Focus:  #3b82f6 (primary-500)
Send Button:         #2563eb (primary-600)
Send Button Hover:   #1d4ed8 (primary-700)
Badge Background:    #ef4444 (red-500)
Badge Text:          #ffffff (white)
```

## Responsive Behavior

### Desktop (>768px)
- Chat window: 320px wide × 400px tall
- Positioned: 16px from right, 96px from bottom
- Full feature set enabled

### Tablet (768px - 1024px)
- Same as desktop
- May overlap with board on smaller screens
- Still fully functional

### Mobile (<768px)
- Chat window: 280px wide × 350px tall
- Positioned closer to edge (8px from right)
- Scrollable message area smaller
- Input remains full-width within window

## User Interactions

### Click Chat Button
```
Before: ● Chat button visible
Action: User clicks button
After:  ■ Chat window opens with animation
```

### Send Message
```
Before: User types "Hello!"
Action: Presses Enter or clicks Send
Result: - Message appears in chat
        - Input clears
        - Auto-scrolls to bottom
        - All players see message instantly
```

### Close Chat
```
Before: ■ Chat window open
Action: User clicks X button
After:  ● Chat button visible with count badge
```

### Scroll Messages
```
Before: [Top messages out of view]
        [Visible messages]
        [Bottom messages]
Action: User scrolls up
Result: Previous messages become visible
Note:   Auto-scroll paused while scrolling up
```

## Edge Cases Handled

✅ Empty message → Send button disabled
✅ Message too long → Character limit enforced
✅ No internet → Error toast shown
✅ Game ends → Chat disappears
✅ Player leaves → Chat remains for others
✅ Rejoining game → Chat history loads
✅ Multiple quick messages → All appear smoothly
✅ Very long word → Word wraps correctly

---

**Visual Style**: Modern, clean, unobtrusive
**Color Theme**: Matches game's dark theme
**Animation**: Smooth 200-300ms transitions
**Usability**: Intuitive, single-click access
