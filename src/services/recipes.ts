import { ApiError, apiRequest } from "@/src/lib/api";
import { getSession } from "./auth";

const COOKIE_SESSION_TOKEN = "__cookie_session__";

export type RecipeIngredient = {
  id?: number;
  name: string;
  quantity?: number;
  unit?: string;
};

export type Recipe = {
  id: string | number;
  title: string;
  description?: string;
  image?: string;
  time?: string;
  calories?: string;
  difficulty?: string;
  rating?: number;
  price?: string;
  people?: number;
  ingredients: RecipeIngredient[] | string[];
  steps?: string[];
  dish_type?: string;
};

export type SearchRecipesParams = {
  difficulty?: "easy" | "medium" | "hard";
  dish_type?: string;
  budget?: string;
  cuisine?: string;
  limit?: number;
  offset?: number;
};

/* ===================== HELPER ===================== */

async function getToken(): Promise<{ token: string | undefined; userId: number | undefined }> {
  const session = await getSession();
  if (!session?.token) throw new Error("Session utilisateur introuvable.");
  const isCookie = session.token === COOKIE_SESSION_TOKEN;
  return {
    token: isCookie ? undefined : session.token,
    userId: session.user?.id as number | undefined,
  };
}

function buildHeaders(userId?: number): Record<string, string> {
  return userId ? { "X-User-Id": String(userId) } : {};
}

/* ===================== API CALLS ===================== */

/**
 * Récupère toutes les recettes
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const { token, userId } = await getToken();
    const data = await apiRequest<Recipe[]>("/admin/recipes/", {
      method: "GET",
      token,
      credentials: "include",
      headers: buildHeaders(userId),
    });
    return data ?? [];
  } catch (error) {
    console.error("[RECIPES] ❌ getAllRecipes:", error instanceof ApiError ? error.message : error);
    throw error;
  }
}

/**
 * Récupère les recettes tendance
 */
export async function getTrendingRecipes(): Promise<Recipe[]> {
  try {
    const { token, userId } = await getToken();
    const data = await apiRequest<Recipe[]>("/admin/recipes/trending", {
      method: "GET",
      token,
      credentials: "include",
      headers: buildHeaders(userId),
    });
    return data ?? [];
  } catch (error) {
    console.error("[RECIPES] ❌ getTrendingRecipes:", error instanceof ApiError ? error.message : error);
    throw error;
  }
}

/**
 * Récupère une recette spécifique par ID
 */
export async function getRecipeById(id: string | number): Promise<Recipe> {
  try {
    const { token, userId } = await getToken();
    const data = await apiRequest<Recipe>(`/admin/recipes/${id}`, {
      method: "GET",
      token,
      credentials: "include",
      headers: buildHeaders(userId),
    });
    
    if (!data) {
      throw new Error(`Recette ${id} non trouvée`);
    }
    
    return data;
  } catch (error) {
    console.error("[RECIPES] ❌ getRecipeById:", error instanceof ApiError ? error.message : error);
    throw error;
  }
}

/**
 * Récupère les recettes favorites de l'utilisateur
 */
export async function getFavoriteRecipes(): Promise<Recipe[]> {
  try {
    const { token, userId } = await getToken();
    const data = await apiRequest<Recipe[]>("/admin/recipes/favorites", {
      method: "GET",
      token,
      credentials: "include",
      headers: buildHeaders(userId),
    });
    return data ?? [];
  } catch (error) {
    console.error("[RECIPES] ❌ getFavoriteRecipes:", error instanceof ApiError ? error.message : error);
    throw error;
  }
}

/**
 * Recherche des recettes avec filtres
 */
export async function searchRecipes(params: SearchRecipesParams): Promise<Recipe[]> {
  try {
    const { token, userId } = await getToken();
    
    // Construire les query parameters
    const queryParams = new URLSearchParams();
    if (params.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params.dish_type) queryParams.append("dish_type", params.dish_type);
    if (params.budget) queryParams.append("budget", params.budget);
    if (params.cuisine) queryParams.append("cuisine", params.cuisine);
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.offset) queryParams.append("offset", String(params.offset));
    
    const queryString = queryParams.toString();
    const path = `/admin/recipes/search${queryString ? `?${queryString}` : ""}`;
    
    const data = await apiRequest<Recipe[]>(path, {
      method: "GET",
      token,
      credentials: "include",
      headers: buildHeaders(userId),
    });
    return data ?? [];
  } catch (error) {
    console.error("[RECIPES] ❌ searchRecipes:", error instanceof ApiError ? error.message : error);
    throw error;
  }
}

/**
 * Ajoute une recette aux favoris
 */
export async function addToFavorites(recipeId: string | number): Promise<void> {
  try {
    const { token, userId } = await getToken();
    await apiRequest(`/admin/recipes/${recipeId}/favorites`, {
      method: "POST",
      token,
      credentials: "include",
      headers: buildHeaders(userId),
    });
  } catch (error) {
    console.error("[RECIPES] ❌ addToFavorites:", error instanceof ApiError ? error.message : error);
    throw error;
  }
}

/**
 * Supprime une recette des favoris
 */
export async function removeFromFavorites(recipeId: string | number): Promise<void> {
  try {
    const { token, userId } = await getToken();
    await apiRequest(`/admin/recipes/${recipeId}/favorites`, {
      method: "DELETE",
      token,
      credentials: "include",
      headers: buildHeaders(userId),
    });
  } catch (error) {
    console.error("[RECIPES] ❌ removeFromFavorites:", error instanceof ApiError ? error.message : error);
    throw error;
  }
}
