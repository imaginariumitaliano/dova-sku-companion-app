# Book Companion App

A mobile app (iOS & Android) that displays images tied to chapters of a book series. Built with React Native + Expo. Content is managed through a free GitHub repository — no paid services required.

---

## Prerequisites

- [Node.js](https://nodejs.org) (v18 or newer)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Expo Go app](https://expo.dev/client) on your phone (for testing)
- A GitHub account

---

## Step 1: Set Up the Content GitHub Repository

This repo stores your images and chapter data. The app fetches content from here at launch.

1. Go to [github.com](https://github.com) and create a **new public repository** named `book-companion-content`
2. Clone it to your computer
3. Inside the repo, create this folder structure:
   ```
   book-companion-content/
   ├── books.json
   └── images/
       └── book1/
           ├── cover.jpg
           ├── ch01/
           │   └── image1.jpg
           ├── ch02/
           │   ├── image1.jpg
           │   └── image2.jpg
           └── ch03/
               └── image1.jpg
   ```
4. Copy the `content/books.json` file from this project into the root of your content repo and fill in your real book title, chapter titles, and image filenames
5. Commit and push everything to GitHub

Image URLs follow this pattern:
```
https://raw.githubusercontent.com/imaginariumitaliano/book-companion-content/main/images/book1/ch01/image1.jpg
```

---

## Step 2: Configure the App

1. Open `src/config.ts`
2. Set `USE_LOCAL_CONTENT = false` once your GitHub content repo is live

---

## Step 3: Fill in `books.json`

Edit `content/books.json` (the one in this project AND the one in your GitHub content repo — they should match):

```json
{
  "books": [
    {
      "id": "book1",
      "title": "Your Book Title",
      "subtitle": "Series Name, Book 1",
      "coverImage": "https://raw.githubusercontent.com/imaginariumitaliano/book-companion-content/main/images/book1/cover.jpg",
      "chapters": [
        {
          "number": 1,
          "title": "The Beginning",
          "images": [
            "https://raw.githubusercontent.com/imaginariumitaliano/book-companion-content/main/images/book1/ch01/image1.jpg"
          ]
        }
      ]
    }
  ]
}
```

---

## Step 4: Run the App

```bash
cd BookCompanionApp
npm install
npm start
```

Scan the QR code with the Expo Go app on your phone.

---

## Adding a New Book (Book 2, 3, etc.)

1. Add a new folder to your content repo: `images/book2/`
2. Add a new entry to `books.json` in your content repo with `"id": "book2"`
3. Commit and push — the app will show the new book automatically on next launch, no app update needed

---

## Adding New Images to an Existing Chapter

1. Upload the image to the correct folder in your content repo (e.g., `images/book1/ch05/image2.jpg`)
2. Add the URL to the chapter's `images` array in `books.json` in your content repo
3. Commit and push — done

---

## Building for the App Store / Google Play

When you're ready to publish:

```bash
npm install -g eas-cli
eas login
eas build --platform ios
eas build --platform android
```

EAS Build has a free tier that covers personal projects.

---

## Project Structure

```
BookCompanionApp/
├── App.tsx                        # Entry point
├── app.json                       # Expo configuration
├── content/
│   └── books.json                 # Local fallback content (used during dev)
└── src/
    ├── config.ts                  # GitHub content URL — edit this first
    ├── types/index.ts             # TypeScript interfaces
    ├── theme/colors.ts            # Color palette
    ├── context/ContentContext.tsx # Fetches and provides book data
    ├── navigation/AppNavigator.tsx
    └── screens/
        ├── BookSelectionScreen.tsx
        ├── ChapterListScreen.tsx
        └── ImageViewerScreen.tsx
```
