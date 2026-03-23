# How to Add the UN-ECA Logo

**Status**: Logo placeholder created ✅
**Action Required**: Download and add the official UN-ECA logo file

---

## Quick Instructions

1. **Download the official UN-ECA logo** from one of these sources:
   - Official UN-ECA website: https://www.uneca.org
   - UN Branding Portal (if you have access)
   - Contact UN-ECA communications team

2. **Rename the logo file** to: `eca-logo.png`
   - Accepted formats: PNG (recommended), JPG, or SVG
   - Recommended: Transparent PNG background
   - Recommended size: 500-1000px wide

3. **Place the file** in this location:
   ```
   frontend/health-financing-dashboard/public/eca-logo.png
   ```

4. **Refresh your browser** - the logo will appear automatically!

---

## Detailed Step-by-Step Guide

### Step 1: Download the Official Logo

#### Option A: From UN-ECA Website
1. Visit: https://www.uneca.org
2. Look for "Media Center" or "Press Kit" sections
3. Download the official UN-ECA logo
4. Choose the version with transparent background (PNG format)

#### Option B: UN Branding Portal
1. If you have access to the UN branding portal
2. Navigate to ECA logos/brand assets
3. Download the horizontal version (logo + text)
4. Choose high resolution (300 DPI or higher)

#### Option C: Contact ECA Communications
1. Email: eca-info@un.org
2. Request: Official UN-ECA logo for digital platform
3. Specify: Need PNG format with transparent background

### Step 2: Prepare the Logo File

#### File Requirements:
- **Format**: PNG (preferred), JPG, or SVG
- **Background**: Transparent (PNG) or white
- **Orientation**: Horizontal (logo + text side by side) works best
- **Size**: 500-1000px wide recommended
- **File size**: Under 500KB recommended

#### Rename the File:
- **Exact filename**: `eca-logo.png`
- **Case sensitive**: Use lowercase
- **No spaces**: Use the exact name above

### Step 3: Add Logo to Project

#### File Location:
```
C:\Users\peter\OneDrive - Smart Workplace\OneDrive documents\GitHub\AI and Data Commons (Google) Project  (UN-ECA-ACS)\Health Financing Gap\health-financing-platform\frontend\health-financing-dashboard\public\eca-logo.png
```

#### Simplified Path (from project root):
```
frontend/health-financing-dashboard/public/eca-logo.png
```

#### How to Add:
1. Open File Explorer
2. Navigate to: `frontend\health-financing-dashboard\public\`
3. Copy your `eca-logo.png` file into this folder
4. Done!

### Step 4: Verify the Logo Appears

1. **If the development server is running**:
   - Just refresh your browser (Ctrl+F5 or Cmd+Shift+R)
   - The logo should appear next to "Africa Health Financing"

2. **If you need to restart the server**:
   ```bash
   cd frontend/health-financing-dashboard
   npm start
   ```

3. **Check the header**:
   - Logo should appear on the left side
   - Next to the title "Africa Health Financing"
   - Before the tagline "United Nations Economic Commission for Africa (ECA)"

---

## What's Already Set Up

### Header Component Updated ✅

The header (`src/components/Layout/Header.tsx`) now includes:

```tsx
<img
  src="/eca-logo.png"
  alt="UN-ECA Logo"
  className="eca-logo"
  onError={(e) => {
    // Hides image if logo file not found
    (e.target as HTMLImageElement).style.display = 'none';
  }}
/>
```

**Smart Features**:
- Automatically hides if logo file not found (no broken image)
- Accessible alt text for screen readers
- Responsive sizing

### CSS Styling Added ✅

Logo styling (`src/components/Layout/Header.css`):

```css
.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.eca-logo {
  height: 60px;
  width: auto;
  object-fit: contain;
}
```

**Benefits**:
- Logo height: 60px (matches header nicely)
- Width: Auto (maintains aspect ratio)
- Gap: 1rem spacing between logo and text
- Aligned vertically with text

---

## Logo Placement Preview

```
┌─────────────────────────────────────────────────────────────┐
│  [UN-ECA LOGO]  Africa Health Financing                      │
│                 United Nations Economic Commission for Africa │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Logo Not Appearing?

**Check 1: File Name**
- Must be exactly: `eca-logo.png`
- Check for typos, extra spaces, or wrong extension

**Check 2: File Location**
- Must be in: `frontend/health-financing-dashboard/public/`
- NOT in `src/` or `src/assets/`

**Check 3: File Format**
- Browser must support the format
- PNG is most reliable
- If using SVG, make sure it's a valid SVG file

**Check 4: Browser Cache**
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache

**Check 5: File Permissions**
- Make sure the file is readable
- Check file properties

### Logo Too Big or Too Small?

**Adjust Height** in `Header.css`:
```css
.eca-logo {
  height: 60px;  /* Change this value */
  width: auto;
  object-fit: contain;
}
```

- **Larger**: Increase to 70px or 80px
- **Smaller**: Decrease to 50px or 40px

### Logo Quality Issues?

**Use Higher Resolution**:
- Original logo should be at least 500px wide
- For retina displays: 1000px wide preferred
- Use PNG format for best quality

**Check Format**:
- PNG: Best quality, supports transparency
- SVG: Scalable, perfect for logos
- JPG: Acceptable but no transparency

---

## Alternative Logo Names

If you need to use a different filename, update the `src` in Header.tsx:

```tsx
// Current (default):
src="/eca-logo.png"

// If you named it differently:
src="/un-eca-logo.png"
src="/eca-logo.svg"
src="/logo.png"
```

---

## Official UN-ECA Logo Guidelines

When downloading/using the logo, ensure you follow:

1. **Official Logo Only**: Use the official UN-ECA logo (not modified versions)
2. **Correct Colors**: UN blue (#009edb or similar)
3. **Proper Spacing**: Maintain clear space around logo
4. **No Distortion**: Don't stretch or skew the logo
5. **Trademark Compliance**: Respect UN-ECA trademark and branding guidelines

---

## Current State (Without Logo)

The platform currently displays:
- ✅ Header text: "Africa Health Financing"
- ✅ Tagline: "United Nations Economic Commission for Africa (ECA)"
- ❌ Logo: **Placeholder ready, file needed**

Once you add `eca-logo.png` to the `public` folder, it will automatically appear!

---

## Expected Result (With Logo)

```
Header Preview:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  [UN-ECA LOGO]    Africa Health Financing                       │
│                   United Nations Economic Commission for Africa  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Questions or Issues?

If you encounter any problems:

1. **Check the browser console** (F12) for error messages
2. **Verify file path** is exactly: `public/eca-logo.png`
3. **Check file size** - very large files (>2MB) may load slowly
4. **Test with different formats** (PNG → SVG → JPG)

---

## Summary

✅ **Header updated** to include logo image element
✅ **CSS styling added** for proper logo display
✅ **Fallback handling** if logo file not found
❌ **Logo file needed** - Download and add `eca-logo.png` to `public/` folder

**Once you add the logo file, refresh your browser and it will appear automatically!**

---

**File Location Reminder**:
```
frontend/health-financing-dashboard/public/eca-logo.png
```

**Download the official logo from**: https://www.uneca.org or contact ECA communications
