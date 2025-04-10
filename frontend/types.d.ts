export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  posts: string[]; // Perubahan dari String[] | Post[] menjadi String[] disebakan oleh writableDraft yang tidak dapat memahami type yang terlalu kompleks
  savePosts: string[]; // Perubahan dari String[] | Post[] menjadi String[] disebakan oleh writableDraft yang tidak dapat memahami type yang terlalu kompleks
  isVerified: boolean;
}

export interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  createdAt: string;
}

export interface Post {
  _id: string;
  caption: string;
  image?: {
    url: string;
    publicId: string;
  };
  user: User | undefined;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}
