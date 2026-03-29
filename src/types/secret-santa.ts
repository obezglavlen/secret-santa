export type WishlistItem = {
  id: string;
  text: string;
  description: string;
};

export type Participant = {
  id: string;
  name: string;
  joinedAt: number;
};

export type Room = {
  id: string;
  name: string;
  createdAt: number;
  startedAt?: number;
  participants: Participant[];
};

export type SelfInfo = {
  participant: {
    id: string;
    name: string;
    isOwner: boolean;
    wishlist: WishlistItem[];
  };
  assignedTo?: {
    id: string;
    name: string;
    wishlist: WishlistItem[];
  };
};
