import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { api, errorMessage } from '../api/client';
import { useApp } from '../context/AppContext.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const fmt = (n) => Number(n.toFixed(2));

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, toggleRecipe, removeRecipe, notify } = useApp();
  const { data: recipe, loading, error, refetch } = useFetch(`/recipes/${id}`);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    if (recipe) setServings(recipe.servings);
  }, [recipe]);

  // Scale ingredient quantities when the servings control changes
  const scaled = useMemo(() => {
    if (!recipe) return [];
    const factor = servings / recipe.servings;
    return recipe.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      unit: ing.RecipeIngredient.unit,
      quantity: fmt(Number(ing.RecipeIngredient.quantity) * factor),
    }));
  }, [recipe, servings]);

  const inList = state.selected.some((r) => r.id === Number(id));

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${recipe.title}"?`)) return;
    try {
      await api.del(`/recipes/${id}`);
      removeRecipe(Number(id));
      notify('Recipe deleted');
      navigate('/');
    } catch (err) {
      notify(errorMessage(err), 'error');
    }
  };

  if (loading && !recipe) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!recipe) return null;

  return (
    <section>
      <Link to="/" className="muted">← Back to recipes</Link>
      <div className="page-head">
        <h1>{recipe.title}</h1>
        <div className="row-gap">
          <button
            className={inList ? 'btn btn-primary' : 'btn btn-outline'}
            onClick={() => toggleRecipe({ id: recipe.id, title: recipe.title })}
          >
            {inList ? '✓ In shopping list' : '+ Shopping list'}
          </button>
          <Link className="btn" to={`/recipes/${id}/edit`}>Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <p className="muted">
        <span className={`pill pill-${recipe.difficulty}`}>{recipe.difficulty}</span>{' '}
        <span className="pill pill-cat">{recipe.category?.name}</span> · ⏱ {recipe.prepTime ?? '–'} min
      </p>

      <div className="two-col">
        <div className="panel">
          <h3>Ingredients</h3>
          <div className="servings">
            <button className="btn btn-small" onClick={() => setServings((s) => Math.max(1, s - 1))}>−</button>
            <strong>{servings} servings</strong>
            <button className="btn btn-small" onClick={() => setServings((s) => s + 1)}>+</button>
          </div>
          {scaled.length === 0 ? (
            <p className="muted">No ingredients added.</p>
          ) : (
            <ul className="ingredient-list">
              {scaled.map((i) => (
                <li key={i.id}>
                  <span>{i.name}</span>
                  <span>{i.quantity} {i.unit}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="panel">
          <h3>Method</h3>
          <p className="preline">{recipe.instructions}</p>
        </div>
      </div>
    </section>
  );
}
