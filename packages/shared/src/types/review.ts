export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content?: string;
  images?: string[];
  qualityGood?: boolean;
  deliveryGood?: boolean;
  transAccurate?: boolean;
  isVisible: boolean;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  orderId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content?: string;
  images?: string[];
  qualityGood?: boolean;
  deliveryGood?: boolean;
  transAccurate?: boolean;
}
