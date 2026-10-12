import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useApp } from '../context/AppContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import RecipeFilters, { EMPTY_FILTERS } from '../components/RecipeFilters.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const LIMIT = 6;

export default function RecipesPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const { state, toggleRecipe } = useApp();

  const categories = useFetch('/categories');

  // useMemo: rebuild the query string only when filters/page change
  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v !== '' && params.set(k, v));
    params.set('page', page);
    params.set('limit', LIMIT);
    return params.toString();
  }, [filters, page]);

  // useEffect (inside useFetch) re-fetches whenever the query changes
  const { data, loading, error, refetch } = useFetch(`/recipes?${query}`);

  const handleApply = useCallback((next) => {
    setFilters(next);
    setPage(1);
  }, []);

  const handleToggle = useCallback(
    (recipe) => toggleRecipe({ id: recipe.id, title: recipe.title }),
    [toggleRecipe]
  );

  const selectedIds = useMemo(() => new Set(state.selected.map((r) => r.id)), [state.selected]);

  return (
    <section>
      <div className="page-head">
        <h1>Recipes</h1>
        <Link className="btn btn-primary" to="/recipes/new">+ New recipe</Link>
      </div>

      <RecipeFilters categories={categories.data || []} onApply={handleApply} />
      <ErrorMessage message={error} onRetry={refetch} />
      {loading && !data && <Loader />}

      {data && (
        <>
          <p className="muted">{data.total} recipe(s) found</p>
          <div className={loading ? 'grid grid-loading' : 'grid'}>
            {data.data.map((r) => (
              <RecipeCard key={r.id} recipe={r} selected={selectedIds.has(r.id)} onToggle={handleToggle} />
            ))}
          </div>
          {data.data.length === 0 && <p className="empty">No recipes match these filters.</p>}
          <Pagination page={data.page} total={data.total} limit={data.limit} onChange={setPage} />
        </>
      )}
    </section>
  );
}
