import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import RecipesPage from './pages/RecipesPage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';
import RecipeFormPage from './pages/RecipeFormPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import IngredientsPage from './pages/IngredientsPage.jsx';
import ShoppingListPage from './pages/ShoppingListPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<RecipesPage />} />
          <Route path="/recipes/new" element={<RecipeFormPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <ToastContainer />
    </>
  );
}
