import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { api, errorMessage } from '../api/client';
import { useApp } from '../context/AppContext.jsx';
import FormField from '../components/FormField.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const EMPTY_FORM = { title: '', instructions: '', prepTime: '', servings: 2, difficulty: 'easy', categoryId: '' };

export default function RecipeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useApp();

  const categories = useFetch('/categories');
  const ingredients = useFetch('/ingredients');
  const existing = useFetch(isEdit ? `/recipes/${id}` : null);

  const rowKey = useRef(0); // useRef: stable counter for row keys
  const [form, setForm] = useState(EMPTY_FORM);
  const [rows, setRows] = useState([{ key: 0, ingredientId: '', quantity: '', unit: '' }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Pre-fill when editing
  useEffect(() => {
    const r = existing.data;
    if (!r) return;
    setForm({
      title: r.title,
      instructions: r.instructions,
      prepTime: r.prepTime ?? '',
      servings: r.servings,
      difficulty: r.difficulty,
      categoryId: r.categoryId,
    });
    setRows(
      r.ingredients.map((i) => ({
        key: ++rowKey.current,
        ingredientId: i.id,
        quantity: Number(i.RecipeIngredient.quantity),
        unit: i.RecipeIngredient.unit,
      }))
    );
  }, [existing.data]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const addRow = useCallback(
    () => setRows((rs) => [...rs, { key: ++rowKey.current, ingredientId: '', quantity: '', unit: '' }]),
    []
  );
  const removeRow = useCallback((key) => setRows((rs) => rs.filter((r) => r.key !== key)), []);

  const changeRow = (key, field, value) =>
    setRows((rs) =>
      rs.map((r) => {
        if (r.key !== key) return r;
        const next = { ...r, [field]: value };
        // auto-fill the unit from the ingredient's default unit
        if (field === 'ingredientId') {
          const ing = (ingredients.data || []).find((i) => i.id === Number(value));
          if (ing && !r.unit) next.unit = ing.defaultUnit || '';
        }
        return next;
      })
    );

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.categoryId) return setFormError('Please choose a category.');

    const payload = {
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      prepTime: form.prepTime === '' ? null : Number(form.prepTime),
      servings: Number(form.servings),
      difficulty: form.difficulty,
      categoryId: Number(form.categoryId),
      ingredients: rows
        .filter((r) => r.ingredientId !== '')
        .map((r) => ({
          ingredientId: Number(r.ingredientId),
          quantity: Number(r.quantity),
          unit: r.unit.trim() || undefined,
        })),
    };

    setSaving(true);
    try {
      const saved = isEdit ? await api.put(`/recipes/${id}`, payload) : await api.post('/recipes', payload);
      notify(isEdit ? 'Recipe updated' : 'Recipe created');
      navigate(`/recipes/${saved.id}`);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (categories.loading || ingredients.loading || (isEdit && existing.loading && !existing.data)) return <Loader />;
  const loadError = categories.error || ingredients.error || existing.error;
  if (loadError) return <ErrorMessage message={loadError} />;

  return (
    <section>
      <Link to={isEdit ? `/recipes/${id}` : '/'} className="muted">← Cancel</Link>
      <h1>{isEdit ? 'Edit recipe' : 'New recipe'}</h1>

      <form className="panel" onSubmit={submit}>
        <FormField label="Title">
          <input name="title" value={form.title} onChange={change} required minLength={3} />
        </FormField>

        <div className="form-grid">
          <FormField label="Category">
            <select name="categoryId" value={form.categoryId} onChange={change} required>
              <option value="">Select…</option>
              {categories.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Difficulty">
            <select name="difficulty" value={form.difficulty} onChange={change}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </FormField>
          <FormField label="Prep time (min)">
            <input type="number" min="1" max="1440" name="prepTime" value={form.prepTime} onChange={change} />
          </FormField>
          <FormField label="Servings">
            <input type="number" min="1" name="servings" value={form.servings} onChange={change} required />
          </FormField>
        </div>

        <FormField label="Instructions">
          <textarea name="instructions" rows="5" value={form.instructions} onChange={change} required />
        </FormField>

        <h3>Ingredients</h3>
        {rows.map((r) => (
          <div className="ingredient-row" key={r.key}>
            <select value={r.ingredientId} onChange={(e) => changeRow(r.key, 'ingredientId', e.target.value)}>
              <option value="">Choose ingredient…</option>
              {ingredients.data.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input
              type="number" min="0.01" step="0.01" placeholder="Qty"
              value={r.quantity} onChange={(e) => changeRow(r.key, 'quantity', e.target.value)}
            />
            <input
              placeholder="Unit" value={r.unit} onChange={(e) => changeRow(r.key, 'unit', e.target.value)}
            />
            <button type="button" className="btn btn-small btn-danger" onClick={() => removeRow(r.key)}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-small" onClick={addRow}>+ Add ingredient</button>

        <ErrorMessage message={formError} />

        <div className="row-gap top-gap">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save recipe'}</button>
        </div>
      </form>
    </section>
  );
}
