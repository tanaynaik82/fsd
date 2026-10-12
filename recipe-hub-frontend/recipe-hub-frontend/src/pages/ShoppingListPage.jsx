import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client';
import { useApp } from '../context/AppContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loader from '../components/Loader.jsx';

export default function ShoppingListPage() {
  const { state, removeRecipe, clearSelection } = useApp();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState({});

  const ids = state.selected.map((r) => r.id);
  const idsKey = ids.join(',');

  // Calls the raw-SQL endpoint whenever the selected recipes change
  useEffect(() => {
    setChecked({});
    setError('');
    if (ids.length === 0) {
      setResult(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    api
      .post('/shopping-list', { recipeIds: ids })
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && (setResult(null), setError(errorMessage(err))))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const toggleChecked = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  return (
    <section>
      <div className="page-head">
        <h1>Shopping List</h1>
        {ids.length > 0 && (
          <div className="row-gap">
            <button className="btn" onClick={() => window.print()}>🖨 Print</button>
            <button className="btn btn-danger" onClick={clearSelection}>Clear all</button>
          </div>
        )}
      </div>

      {ids.length === 0 ? (
        <p className="empty">
          No recipes selected yet. <Link to="/">Browse recipes</Link> and click “+ Shopping list”.
        </p>
      ) : (
        <div className="two-col">
          <div className="panel">
            <h3>Selected recipes ({ids.length})</h3>
            <ul className="ingredient-list">
              {state.selected.map((r) => (
                <li key={r.id}>
                  <Link to={`/recipes/${r.id}`}>{r.title}</Link>
                  <button className="btn btn-small" onClick={() => removeRecipe(r.id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h3>Ingredients to buy</h3>
            {loading && <Loader text="Building list…" />}
            <ErrorMessage message={error} />
            {result && (
              <ul className="ingredient-list">
                {result.items.map((item) => {
                  const key = `${item.ingredientId}-${item.unit}`;
                  return (
                    <li key={key} className={checked[key] ? 'done' : ''}>
                      <label className="check">
                        <input type="checkbox" checked={Boolean(checked[key])} onChange={() => toggleChecked(key)} />
                        <span>{item.name}</span>
                      </label>
                      <span>
                        <strong>{item.totalQuantity} {item.unit}</strong>
                        {item.usedInRecipes > 1 && <small className="muted"> · used in {item.usedInRecipes} recipes</small>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
