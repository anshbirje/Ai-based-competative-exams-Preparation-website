# StudySage - AI-Powered Study Assistant

StudySage is a cutting-edge study platform that leverages AI to transform your learning experience. Generate structured notes and interactive flashcards from keywords, images, or PDFs in seconds.

## ✨ Features

-   **AI Note Generation**: Create comprehensive study notes from text topics, uploaded images, or PDF documents.
-   **Subject Management**: Organize your learning into custom subjects. Rename or delete them as your curriculum evolves.
-   **Interactive Flashcards**: Automatically turn any note into a deck of flashcards for active recall.
-   **Secure Storage**: Your notes and subjects are securely stored and synced across devices using Firebase.

---

## 🚀 Detailed Installation & Setup

Follow these steps precisely to get StudySage running on your local machine.

### Step 1: Clone and Install Dependencies

Open your terminal in the project root and run:

```bash
npm install
```

### Step 2: Firebase Project Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and name it `StudySage`.
3.  Disable Google Analytics (optional).
4.  Once created, click the **Web icon (`</>`)** to register a new web app.
5.  **Copy the `firebaseConfig` object** provided in the setup instructions.
6.  In the Firebase Sidebar:
    -   **Authentication**: Click "Get Started" and enable "Email/Password" provider.
    -   **Cloud Firestore**: Click "Create database", choose a location, and start in **Test Mode** (or apply the rules from `firestore.rules`).

### Step 3: Google AI (Gemini) API Key

1.  Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Click **"Create API key"**.
3.  Copy the generated key.

### Step 4: Environment Variables

Create a file named `.env` in the root of your project and paste the following, filling in your specific values:

```env
# Firebase Configuration (From Step 2)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# Genkit (Gemini) API Key (From Step 3)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Step 5: Start the Development Servers

You must run **two separate terminal windows** for the app to function fully.

**Terminal 1 (Next.js Web App):**
```bash
npm run dev
```

**Terminal 2 (Genkit AI Engine):**
```bash
npm run genkit:dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to start studying!

---

## 🛠 Tech Stack

-   **Next.js 15**: React framework with App Router.
-   **Firebase**: Authentication and Real-time Firestore database.
-   **Genkit**: Firebase's framework for AI workflows.
-   **Gemini 1.5 Flash**: Google's efficient and powerful multimodal LLM.
-   **Tailwind CSS & Shadcn UI**: Modern, responsive styling.

---

## 📝 Usage Guide

1.  **Sign Up**: Create an account to keep your data private.
2.  **Create a Subject**: Use the sidebar to add a subject (e.g., "Biology").
3.  **Generate Notes**: Click "New Note", choose a method (Keywords, Image, or PDF), and click "Generate".
4.  **Save**: Review the AI output, select your subject, and click "Save Note".
5.  **Review**: Open a note and click "Flashcards" to start an active recall session.
