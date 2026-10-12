import { useEffect, useRef, useState } from 'react';

export const EMPTY_FILTERS = {
  search: '',
  category: '',
  difficulty: '',
  maxTime: '',
  ingredient: '',
  sort: 'title',
  order: 'ASC',
};

export default function RecipeFilters({ categories, onApply }) {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const searchRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus(); // useRef: direct DOM access
  }, []);

  const change = (e) => setDraft((d) => ({ ...d, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onApply(draft);
  };

  const reset = () => {
    setDraft(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
    searchRef.current?.focus();
  };

  return (
    <form className="filters" onSubmit={submit}>
      <input ref={searchRef} name="search" placeholder="Search title or method…" value={draft.search} onChange={change} />
      <input name="ingredient" placeholder="Has ingredient (e.g. tomato)" value={draft.ingredient} onChange={change} />
      <select name="category" value={draft.category} onChange={change}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select name="difficulty" value={draft.difficulty} onChange={change}>
        <option value="">Any difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <input type="number" min="1" name="maxTime" placeholder="Max minutes" value={draft.maxTime} onChange={change} />
      <select name="sort" value={draft.sort} onChange={change}>
        <option value="title">Sort: Title</option>
        <option value="prepTime">Sort: Prep time</option>
        <option value="servings">Sort: Servings</option>
        <option value="createdAt">Sort: Newest</option>
      </select>
      <select name="order" value={draft.order} onChange={change}>
        <option value="ASC">Ascending</option>
        <option value="DESC">Descending</option>
      </select>
      <div className="filters-buttons">
        <button type="submit" className="btn btn-primary">Apply</button>
        <button type="button" className="btn" onClick={reset}>Reset</button>
      </div>
    </form>
  );
}
