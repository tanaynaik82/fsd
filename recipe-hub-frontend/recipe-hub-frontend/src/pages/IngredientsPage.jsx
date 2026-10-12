import CrudManager from '../components/CrudManager.jsx';

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'defaultUnit', label: 'Default unit (g, ml, pcs…)' },
];

export default function IngredientsPage() {
  return <CrudManager title="Ingredients" endpoint="/ingredients" fields={FIELDS} />;
}
