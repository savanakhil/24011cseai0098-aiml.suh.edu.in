export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  date: string;
  imageUrl: string;
  reporterUid: string;
  status: 'active' | 'recovered';
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: string[];
  itemId: string;
  lastMessage: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderUid: string;
  text: string;
  createdAt: string;
}
