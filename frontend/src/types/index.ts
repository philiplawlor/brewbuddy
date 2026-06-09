// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// API types
export interface ApiError {
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Recipe types
export interface Recipe {
  _id: string;
  userId?: string;
  recipeName: string;
  style?: string;
  styleCode?: string;
  method?: 'all_grain' | 'partial_mash' | 'extract' | 'biab';
  batchSize?: number;
  batchSizeUnit?: 'L' | 'gal' | 'bbl';
  boilTimeMinutes?: number;
  efficiency?: number;
  estimatedOg?: number;
  estimatedFg?: number;
  estimatedAbv?: number;
  estimatedIbu?: number;
  estimatedSrm?: number;
  estimatedCalories?: number;
  notes?: string;
  isPublic?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  _id: string;
  recipeId: string;
  ingredientType: 'grain' | 'hops' | 'yeast' | 'adjunct' | 'chemical';
  order?: number;
  name?: string;
  category?: string;
  grainWeight?: number;
  grainWeightUnit?: 'lb' | 'kg' | 'g' | 'oz';
  lovibond?: number;
  potentialExtract?: number;
  yieldPercent?: number;
  hopsWeight?: number;
  hopsWeightUnit?: 'g' | 'oz' | 'lb';
  hopAdditionTime?: string;
  hopAlphaAcid?: number;
  hopBoilMinutes?: number;
  hopForm?: 'pellet' | 'whole_leaf' | 'extract' | 'cryo';
  yeastPackageCount?: number;
  yeastStarterSizeMl?: number;
  yeastCellCount?: number;
  yeastType?: string;
  yeastForm?: string;
  strainId?: string;
  laboratory?: string;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
