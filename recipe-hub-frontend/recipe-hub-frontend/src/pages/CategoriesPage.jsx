import CrudManager from '../components/CrudManager.jsx';

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export default function CategoriesPage() {
  return <CrudManager title="Categories" endpoint="/categories" fields={FIELDS} />;
}
