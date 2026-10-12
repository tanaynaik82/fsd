import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'recipehub_selected';

function init() {
  let selected = [];
  try {
    selected = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    selected = [];
  }
  return { selected, toasts: [] };
}

// Global state: recipes picked for the shopping list + toast notifications
function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_RECIPE': {
      const exists = state.selected.some((r) => r.id === action.recipe.id);
      return {
        ...state,
        selected: exists
          ? state.selected.filter((r) => r.id !== action.recipe.id)
          : [...state.selected, action.recipe],
      };
    }
    case 'REMOVE_RECIPE':
      return { ...state, selected: state.selected.filter((r) => r.id !== action.id) };
    case 'CLEAR_SELECTION':
      return { ...state, selected: [] };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.selected));
    } catch {
      /* storage unavailable */
    }
  }, [state.selected]);

  const toggleRecipe = useCallback((recipe) => dispatch({ type: 'TOGGLE_RECIPE', recipe }), []);
  const removeRecipe = useCallback((id) => dispatch({ type: 'REMOVE_RECIPE', id }), []);
  const clearSelection = useCallback(() => dispatch({ type: 'CLEAR_SELECTION' }), []);
  const notify = useCallback(
    (message, type = 'success') =>
      dispatch({ type: 'ADD_TOAST', toast: { id: `${Date.now()}-${Math.random()}`, message, type } }),
    []
  );
  const dismissToast = useCallback((id) => dispatch({ type: 'REMOVE_TOAST', id }), []);

  const value = useMemo(
    () => ({ state, toggleRecipe, removeRecipe, clearSelection, notify, dismissToast }),
    [state, toggleRecipe, removeRecipe, clearSelection, notify, dismissToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
