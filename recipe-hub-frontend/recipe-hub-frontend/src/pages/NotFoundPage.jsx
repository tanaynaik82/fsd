import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section>
      <h1>404: Page not found</h1>
      <Link to="/">Go back to recipes</Link>
    </section>
  );
}
