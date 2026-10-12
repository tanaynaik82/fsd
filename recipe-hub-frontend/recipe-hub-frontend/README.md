# Recipe Hub: Frontend (ISA-III)

React 18 + Vite + React Router. Talks to the ISA-II backend at `http://localhost:5000/api`.

## Run
```bash
# 1. start the backend first (in the backend folder): npm run dev
# 2. then here:
npm install
npm run dev        # http://localhost:5173
```
To use a different backend URL, copy `.env.example` to `.env` and edit `VITE_API_URL`.

## Pages / routes
| Route | Page |
|---|---|
| `/` | Recipe list: filters, sorting, pagination, add to shopping list |
| `/recipes/new`, `/recipes/:id/edit` | Create / edit a recipe with dynamic ingredient rows |
| `/recipes/:id` | Recipe detail, servings scaler, edit / delete |
| `/categories` | Category CRUD (delete blocked by backend when recipes exist) |
| `/ingredients` | Ingredient CRUD |
| `/shopping-list` | Consolidated shopping list (calls the raw-SQL endpoint) |

## Rubric mapping
**Component reuse, structure, routing:** `components/` (Navbar, RecipeCard, RecipeFilters, Pagination, FormField, Loader, ErrorMessage, ToastContainer, and `CrudManager`, which is reused by both Categories and Ingredients via props); `react-router-dom` `Routes`, `NavLink`, `useParams`, `useNavigate`.

**Hooks:**
- `useState`: forms, filters, page, servings, checkbox state
- `useEffect`: data fetching (`hooks/useFetch.js`), pre-filling the edit form, toast timers, shopping-list rebuild
- `useContext` + `useReducer`: `context/AppContext.jsx` holds the selected shopping-list recipes and toasts globally
- `useMemo`: query string, selected-id set, scaled ingredient quantities
- `useCallback` + `React.memo`: `RecipeCard` avoids re-rendering on unrelated updates
- `useRef`: auto-focus on inputs, stable row-key counter

**Full-stack flow:** forms POST/PUT to Express, MySQL is updated, lists re-fetch and re-render.

## 5-minute demo script
1. Filter recipes (`maxTime=30`, ingredient `tomato`).
2. Create a new recipe with 2-3 ingredients → show it in the list.
3. Edit it (change prep time) → detail page updates.
4. Add 2-3 recipes to the shopping list → open Shopping List and show merged quantities.
5. Try deleting a category that has recipes → show the 409 message.
