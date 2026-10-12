export default function Pagination({ page, total, limit, onChange }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn btn-small" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <span>Page {page} of {pages}</span>
      <button className="btn btn-small" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}
