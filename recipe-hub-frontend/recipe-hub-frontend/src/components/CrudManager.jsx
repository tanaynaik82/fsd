import { useMemo, useRef, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { api, errorMessage } from '../api/client';
import { useApp } from '../context/AppContext.jsx';
import Loader from './Loader.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import FormField from './FormField.jsx';

// fields: [{ name, label, type?: 'text' | 'textarea', required? }]
export default function CrudManager({ title, endpoint, fields }) {
  const { data, loading, error, refetch } = useFetch(endpoint);
  const { notify } = useApp();
  const empty = useMemo(() => Object.fromEntries(fields.map((f) => [f.name, ''])), [fields]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const firstInput = useRef(null);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm(Object.fromEntries(fields.map((f) => [f.name, item[f.name] ?? ''])));
    firstInput.current?.focus();
  };

  const cancel = () => {
    setEditingId(null);
    setForm(empty);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => String(v).trim() !== ''));
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, payload);
        notify(`${title.slice(0, -1)} updated`);
      } else {
        await api.post(endpoint, payload);
        notify(`${title.slice(0, -1)} created`);
      }
      cancel();
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await api.del(`${endpoint}/${item.id}`);
      notify(`"${item.name}" deleted`);
      if (editingId === item.id) cancel();
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error'); // e.g. 409 when still in use
    }
  };

  return (
    <section>
      <h1>{title}</h1>

      <form className="panel crud-form" onSubmit={submit}>
        <h3>{editingId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</h3>
        {fields.map((f, i) => (
          <FormField key={f.name} label={f.label}>
            {f.type === 'textarea' ? (
              <textarea name={f.name} rows="2" value={form[f.name]} onChange={change} />
            ) : (
              <input
                ref={i === 0 ? firstInput : null}
                name={f.name}
                value={form[f.name]}
                onChange={change}
                required={f.required}
              />
            )}
          </FormField>
        ))}
        <div className="row-gap">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" className="btn" onClick={cancel}>Cancel</button>}
        </div>
      </form>

      {loading && !data && <Loader />}
      <ErrorMessage message={error} onRetry={refetch} />

      {data && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                {fields.map((f) => <th key={f.name}>{f.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr><td colSpan={fields.length + 2} className="muted">Nothing here yet.</td></tr>
              )}
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  {fields.map((f) => <td key={f.name}>{item[f.name]}</td>)}
                  <td className="actions">
                    <button className="btn btn-small" onClick={() => startEdit(item)}>Edit</button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(item)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
