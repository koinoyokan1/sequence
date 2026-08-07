# Open Graph Images for Social Media

This folder contains Open Graph (OG) images used when sharing Sequence Online on social media platforms.

## Required Images

All images must be **1200×630 pixels** (1.91:1 aspect ratio).

### Files Needed:

1. **`landing.png`** (1200×630px)
   - **Usage:** Homepage (/)
   - **Content:** Main hero image with "SEQUENCE" title, game board visual
   - **Text:** "Play Free Online Multiplayer Board Game"
   - **Status:** ⚠️ **TO BE CREATED**

2. **`create.png`** (1200×630px)
   - **Usage:** Create Game page (/create)
   - **Content:** "Create a Game" heading, hosting visual
   - **Text:** "Invite Friends • Choose Team • Start Playing"
   - **Status:** ⚠️ **TO BE CREATED**

3. **`join.png`** (1200×630px)
   - **Usage:** Join Game page (/join)
   - **Content:** "Join a Game" heading, game code visual
   - **Text:** "Enter Code & Play with Friends"
   - **Status:** ⚠️ **TO BE CREATED**

4. **`game.png`** (1200×630px)
   - **Usage:** Lobby & Game pages (/lobby, /game)
   - **Content:** Active game board screenshot, game pieces
   - **Text:** "Strategic Multiplayer Gameplay"
   - **Status:** ⚠️ **TO BE CREATED**

5. **`credits.png`** (1200×630px)
   - **Usage:** Credits page (/credits)
   - **Content:** "Built by Ajay Nair" with origin story elements
   - **Text:** "Made with ❤️ and Frustration"
   - **Status:** ⚠️ **TO BE CREATED**

## Design Specifications

### Dimensions
- **Width:** 1200 pixels
- **Height:** 630 pixels
- **Aspect Ratio:** 1.91:1

### File Format
- **Preferred:** PNG (best quality, transparency support)
- **Alternative:** JPEG (smaller file size)
- **Max Size:** <300 KB for WhatsApp compatibility
- **Compression:** Use TinyPNG or similar if needed

### Design Guidelines

#### Colors (Match App Theme)
- **Background:** #111827 (gray-900) or darker gradient
- **Primary:** #2563eb (blue)
- **Text:** #ffffff (white) or #e5e7eb (gray-200)
- **Accent:** #f59e0b (orange/yellow for highlights)

#### Typography
- **Minimum font size:** 48px (smaller text won't be readable)
- **Font weight:** Bold/Semibold for headlines
- **Font family:** System fonts or open source (Inter, Roboto, Poppins)
- **Contrast:** Ensure high contrast for readability

#### Safe Zone
- **Keep critical content within inner 80%** of the image
- Social platforms crop/scale differently
- Edges may be cut off on some platforms
- Center the most important elements

#### Visual Elements
- Use game board graphics/screenshots
- Include card suit symbols (♠ ♥ ♣ ♦)
- Show game chips/pieces
- Keep it clean and uncluttered

## Platform Preview Sizes

Different platforms display OG images at different sizes:

| Platform | Display Size | Aspect Ratio |
|----------|-------------|--------------|
| **Facebook** | 1200×630 | 1.91:1 |
| **LinkedIn** | 1200×627 | 1.91:1 |
| **Twitter/X** | 1200×675 (crops to fit) | 16:9 preferred |
| **WhatsApp** | Variable (max 300 KB) | 1.91:1 |
| **Discord** | 1200×630 | 1.91:1 |
| **Slack** | 1200×630 | 1.91:1 |

**Recommended Universal Size:** 1200×630px works everywhere.

## Creation Tools

### Free Online Tools
1. **Canva** - https://canva.com
   - Pre-made social media templates
   - Easy drag-and-drop interface
   - Free tier available

2. **Figma** - https://figma.com
   - Professional design tool
   - Great for precise layouts
   - Free for personal use

3. **Photopea** - https://photopea.com
   - Free Photoshop alternative
   - Browser-based, no install
   - Supports PSD files

### Design Tips
1. Start with a 1200×630px canvas
2. Use dark background matching the app (#111827)
3. Add large, bold text (min 48px)
4. Include game visuals (board, cards, chips)
5. Keep important content centered
6. Export as PNG or JPEG
7. Compress if > 300 KB (for WhatsApp)

## Quick HTML Template

If you want to code an image using HTML/CSS:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .container {
      text-align: center;
      color: white;
    }
    h1 {
      font-size: 96px;
      font-weight: 800;
      margin: 0 0 20px 0;
      letter-spacing: -2px;
    }
    p {
      font-size: 48px;
      font-weight: 600;
      margin: 0;
      color: #60a5fa;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>SEQUENCE</h1>
    <p>Play Free Online</p>
  </div>
</body>
</html>
```

Screenshot this at 1200×630px using browser dev tools.

## Testing Your Images

Before deploying:

1. **Visual Check**
   - Open in image viewer at 100%
   - Check text is readable
   - Verify no pixelation

2. **File Size**
   - Should be < 300 KB for WhatsApp
   - Use TinyPNG.com to compress if needed

3. **Social Media Debuggers**
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

## Current Status

- [x] Folder created (`public/og-images/`)
- [x] README with specifications
- [ ] `landing.png` (1200×630)
- [ ] `create.png` (1200×630)
- [ ] `join.png` (1200×630)
- [ ] `game.png` (1200×630)
- [ ] `credits.png` (1200×630)

## After Creating Images

1. Add files to `public/og-images/` folder
2. Commit and push to repository
3. Deploy to GitHub Pages
4. Test previews on social platforms
5. Force refresh Facebook cache if needed
6. Monitor share performance

---

**Note:** Without these images, social media shares will show a generic preview or no image. Creating high-quality OG images can increase click-through rates by 30-40%.
