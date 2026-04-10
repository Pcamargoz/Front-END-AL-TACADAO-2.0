import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Produto } from "../api/client";
import {
  apiCarrinhoAdicionar,
  apiCarrinhoRemover,
  apiCarrinhoLimpar,
  apiCarrinhoListarUsuario,
  apiGetProduto,
} from "../api/client";
import { useAuth } from "../auth/AuthContext";

// Item do carrinho com quantidade
export interface CartItem {
  product: Produto;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Produto; quantity?: number; price?: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; items: CartItem[] };

const STORAGE_KEY = "altacadao_cart";

function calculateTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === action.product.id
      );

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        newItems = state.items.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + (action.quantity || 1) }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            product: action.product,
            quantity: action.quantity || 1,
            price: action.price ?? action.product.preco ?? 0,
          },
        ];
      }

      return { items: newItems, ...calculateTotals(newItems) };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.product.id !== action.productId
      );
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        const newItems = state.items.filter(
          (item) => item.product.id !== action.productId
        );
        return { items: newItems, ...calculateTotals(newItems) };
      }

      const newItems = state.items.map((item) =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case "CLEAR_CART":
      return { items: [], totalItems: 0, totalPrice: 0 };

    case "LOAD_CART":
      return { items: action.items, ...calculateTotals(action.items) };

    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addItem: (product: Produto, quantity?: number, price?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  // productId -> lista de IDs do backend (1 ID por unidade)
  const remoteIdsRef = useRef<Record<string, string[]>>({});

  // Carrega carrinho do localStorage quando não há usuário logado
  useEffect(() => {
    if (!user) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const items = JSON.parse(saved) as CartItem[];
          dispatch({ type: "LOAD_CART", items });
        }
      } catch {
        // ignora erros de parsing
      }
    }
  }, []);

  // Persiste no localStorage apenas para usuários não logados
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, user]);

  // Quando o usuário faz login ou muda: carrega carrinho do backend
  const loadFromBackend = useCallback(async (userId: string) => {
    try {
      const backendItems = await apiCarrinhoListarUsuario(userId);

      // Agrupa por produto: productId -> [remoteId, ...]
      const grouped: Record<string, string[]> = {};
      for (const item of backendItems) {
        const pid = item.produto;
        if (!grouped[pid]) grouped[pid] = [];
        grouped[pid].push(item.id);
      }
      remoteIdsRef.current = grouped;

      // Busca detalhes dos produtos únicos
      const uniqueProductIds = Object.keys(grouped);
      const productResults = await Promise.all(
        uniqueProductIds.map((id) => apiGetProduto(id).catch(() => null))
      );

      const cartItems: CartItem[] = uniqueProductIds
        .map((productId, i) => {
          const product = productResults[i];
          if (!product) return null;
          return {
            product,
            quantity: grouped[productId].length,
            price: product.preco ?? 0,
          };
        })
        .filter((item): item is CartItem => item !== null);

      dispatch({ type: "LOAD_CART", items: cartItems });
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Erro ao carregar carrinho do backend:", err);
    }
  }, []);

  useEffect(() => {
    if (user?.userId) {
      void loadFromBackend(user.userId);
    } else if (!user) {
      // Logout: limpa remoteIds e carrega do localStorage
      remoteIdsRef.current = {};
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const items = saved ? (JSON.parse(saved) as CartItem[]) : [];
        dispatch({ type: "LOAD_CART", items });
      } catch {
        dispatch({ type: "CLEAR_CART" });
      }
    }
  }, [user?.userId, loadFromBackend]);

  const addItem = useCallback(
    (product: Produto, quantity = 1, price?: number) => {
      // Atualização otimista imediata
      dispatch({ type: "ADD_ITEM", product, quantity, price });

      if (!user?.userId || !product.fornecedor?.id) return;

      const userId = user.userId;
      const fornecedorId = product.fornecedor.id;

      // Sincroniza com backend em background
      void (async () => {
        for (let i = 0; i < quantity; i++) {
          try {
            const remote = await apiCarrinhoAdicionar({
              produto: product.id,
              usuario: userId,
              fornecedorId,
            });
            const prev = remoteIdsRef.current[product.id] ?? [];
            remoteIdsRef.current = {
              ...remoteIdsRef.current,
              [product.id]: [...prev, remote.id],
            };
          } catch (err) {
            console.error("Erro ao sincronizar adição com backend:", err);
          }
        }
      })();
    },
    [user?.userId]
  );

  const removeItem = useCallback(
    (productId: string) => {
      // Atualização otimista imediata
      dispatch({ type: "REMOVE_ITEM", productId });

      if (!user?.userId) return;

      const ids = remoteIdsRef.current[productId] ?? [];
      const { [productId]: _removed, ...rest } = remoteIdsRef.current;
      remoteIdsRef.current = rest;

      void (async () => {
        for (const id of ids) {
          try {
            await apiCarrinhoRemover(id);
          } catch (err) {
            console.error("Erro ao remover item do backend:", err);
          }
        }
      })();
    },
    [user?.userId]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      // Atualização otimista imediata
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity });

      if (!user?.userId) return;

      const currentIds = remoteIdsRef.current[productId] ?? [];
      const diff = quantity - currentIds.length;

      if (diff === 0) return;

      void (async () => {
        if (diff > 0) {
          // Adiciona registros faltantes
          const item = state.items.find((i) => i.product.id === productId);
          const fornecedorId = item?.product.fornecedor?.id;
          if (!fornecedorId) return;

          for (let i = 0; i < diff; i++) {
            try {
              const remote = await apiCarrinhoAdicionar({
                produto: productId,
                usuario: user.userId,
                fornecedorId,
              });
              remoteIdsRef.current = {
                ...remoteIdsRef.current,
                [productId]: [...(remoteIdsRef.current[productId] ?? []), remote.id],
              };
            } catch (err) {
              console.error("Erro ao incrementar quantidade no backend:", err);
            }
          }
        } else {
          // Remove registros excedentes (do final da lista)
          const toRemove = currentIds.slice(quantity);
          remoteIdsRef.current = {
            ...remoteIdsRef.current,
            [productId]: currentIds.slice(0, quantity),
          };

          for (const id of toRemove) {
            try {
              await apiCarrinhoRemover(id);
            } catch (err) {
              console.error("Erro ao decrementar quantidade no backend:", err);
            }
          }
        }
      })();
    },
    [user?.userId, state.items, removeItem]
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });

    if (!user?.userId) return;

    const userId = user.userId;
    remoteIdsRef.current = {};

    void (async () => {
      try {
        await apiCarrinhoLimpar(userId);
      } catch (err) {
        console.error("Erro ao limpar carrinho no backend:", err);
      }
    })();
  }, [user?.userId]);

  const isInCart = useCallback(
    (productId: string) => state.items.some((item) => item.product.id === productId),
    [state.items]
  );

  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = state.items.find((item) => item.product.id === productId);
      return item?.quantity ?? 0;
    },
    [state.items]
  );

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve estar dentro de CartProvider");
  return ctx;
}
