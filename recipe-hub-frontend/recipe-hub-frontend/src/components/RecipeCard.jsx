import { memo } from 'react';
import { Link } from 'react-router-dom';

// memo: only re-renders when its own props change (onToggle is a stable useCallback)
function RecipeCard({ recipe, selected, onToggle }) {
  return (
    <article className="card">
      <div className="card-head">
        <span className={`pill pill-${recipe.difficulty}`}>{recipe.difficulty}</span>
        {recipe.category && <span className="pill pill-cat">{recipe.category.name}</span>}
      </div>
      <h3>
        <Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
      </h3>
      <p className="muted">
        ⏱ {recipe.prepTime ?? '–'} min · 🍽 {recipe.servings} servings · 🥕 {recipe.ingredients.length} ingredients
      </p>
      <div className="card-actions">
        <Link className="btn btn-small" to={`/recipes/${recipe.id}`}>View</Link>
        <button
          className={selected ? 'btn btn-small btn-primary' : 'btn btn-small btn-outline'}
          onClick={() => onToggle(recipe)}
        >
          {selected ? '✓ In shopping list' : '+ Shopping list'}
        </button>
      </div>
    </article>
  );
}

export default memo(RecipeCard);
