﻿![Nexora Icon](https://github.com/user-attachments/assets/f61e1107-b915-4a69-b6e2-4bc78cea7ade)

## Disclaimer

This project was created by following a YouTube tutorial.  
Special thanks to **WebDevWarriors** for their excellent guidance and content.  
You can watch the tutorial here: [\[https://youtu.be/6XF_uhF4axg\](https://youtu.be/6XF_uhF4axsi=-C_GViWdJj7MoqQV)](https://www.youtube.com/watch?v=6XF_uhF4axg&t)

# Nexora

- Nexora is a social media web app based on a YouTube tutorial, with custom features I developed independently to enhance and personalize the project.

## Nexora feature

### 🔐 Authentication & User Management

- Sign Up & Login: Email-based registration, login, and OTP email verification.

- Edit Profile: Update username, bio, password, and profile picture.

- Profile Picture Management: Upload and update profile images (stored on Cloudinary).

- Role Management (**Developed independently**): Users can be assigned roles (admin/owner); admins can update roles of other users.

- Account Deletion (**Developed independently**): Admins or owners can delete user accounts along with all related data.

### 🏠 Home & Feed

- Feed Display: Browse posts from all users in a chronological or algorithmic feed.

- Like/Unlike Posts: Interact with posts through like and unlike functionality.

- Comments: Add, view, and delete comments on posts.

- Bookmark Posts: Save or remove posts to/from personal bookmarks.

### 📝 Post Management

- Create Posts: Share new posts with images and captions.

- Delete Posts: Users can delete their own posts.

- Image Upload: Post images are uploaded and hosted via Cloudinary.

### 👤 User Profile

- View Profiles: Explore your own profile or other users’ profiles with posts and bios.

- Follow/Unfollow: Connect with other users through a follow system.

- Saved Posts Tab: Dedicated section for viewing bookmarked posts.

### 🔎 Search & User Recommendations

- Search Users (**Developed independently**): Search functionality with partial match support.

- Suggested Users (**Developing its features further with the refresh feature and See All button**): Sidebar with user recommendations to encourage new connections.

### ⚙️ Admin Panel

- User Management (**Developed independently**) : Admins can view all users, search for users, and modify user roles.

- User Account Control (**Developed independently**) : Admins can delete user accounts and their data.

### 💬 UI/UX & Supporting Components

- Dialogs & Modals: Reusable components for confirmations, comments, settings, and more.

- Sidebar Navigation: Includes a main navigation bar (LeftSidebar) and suggested users panel (RightSidebar).

- Responsive Design: Fully adaptable layout across mobile, tablet, and desktop devices.

- Loading States: Animated loaders for asynchronous actions.

- Toast Notifications: Real-time feedback for user actions (success/error).

### 🧰 Tech Stack & Tools

- Framework: Next.js (App Router)

- State Management: Redux Toolkit + Redux Persist

- Styling: Tailwind CSS

- Image Storage: Cloudinary

- Database: MongoDB

- Notifications: Sonner (toast notifications)

- UI Components: Radix UI (for dialogs, avatars, etc.)

## 🚀 Getting Started

Follow these steps to run the Nexora project locally:

1. Install Dependencies
   Navigate into each project folder and install the required dependencies:

```javascript
cd .\backend\
npm install
```

```javascript
cd .\frontend\
npm install
```

2. Create Environment Variable Files
   Backend Create a .env file inside the backend folder. Example contents:

```javascript
MONGODB_URI= your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

Frontend Create a .env file inside the frontend folder. Example contents:

```javascript
NEXT_PUBLIC_BACKEND_API=http://localhost:
```

3. Start MongoDB
   Ensure MongoDB is running on your local machine, or connect using MongoDB Atlas.

4. Run the Backend
   Start the backend server:

```javascript
cd backend
npm run dev
```

Or if you prefer **yarn**:

```javascript
yarn dev
```

5. Run the Frontend
   Start the frontend development server:

```javascript
cd frontend
npm run dev
```

Or if you prefer **yarn**:

```javascript
yarn dev
```
