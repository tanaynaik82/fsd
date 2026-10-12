import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Navbar() {
  const { state } = useApp();
  const link = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          🍳 Recipe Hub
        </NavLink>
        <nav>
          <NavLink to="/" end className={link}>Recipes</NavLink>
          <NavLink to="/categories" className={link}>Categories</NavLink>
          <NavLink to="/ingredients" className={link}>Ingredients</NavLink>
          <NavLink to="/shopping-list" className={link}>
            Shopping List
            {state.selected.length > 0 && <span className="badge-count">{state.selected.length}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
