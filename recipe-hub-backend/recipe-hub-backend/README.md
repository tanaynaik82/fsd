# Recipe Hub & Ingredient Shopping List: Backend API (ISA-II)

REST API built with **Node.js, Express, Sequelize ORM and MySQL**.

## Associations
| Type | Relationship |
|---|---|
| **1:M** | `Category` has many `Recipe` (`Recipes.categoryId`, `ON DELETE RESTRICT`) |
| **M:N** | `Recipe` <-> `Ingredient` through junction table `RecipeIngredients` (`quantity`, `unit`) |

## Folder structure
```
/config        database.js (Sequelize connection), config.js (env + sequelize-cli)
/models        category, recipe, ingredient, recipeIngredient, index (associations)
/migrations    4 migration files (tables, FKs, constraints)
/seeders       demo data (5 categories, 20 ingredients, 8 recipes)
/controllers   business logic
/routes        Express routers
/middleware    error handler (Sequelize errors -> HTTP codes)
app.js, server.js, postman_collection.json
```

## Setup
```bash
npm install
cp .env.example .env        # then edit DB credentials
npm run db:create           # creates the MySQL database
npm run db:migrate          # creates tables
npm run db:seed             # loads demo data
npm run dev                 # or: npm start   -> http://localhost:5000
```
Reset everything: `npm run db:reset`.
Import `postman_collection.json` into Postman (variable `baseUrl` = `http://localhost:5000`).

## Validations & constraints
- Category / Ingredient `name`: NOT NULL, UNIQUE, non-empty
- Recipe `title` 3-150 chars, `instructions` NOT NULL, `prepTime` 1-1440, `servings` >= 1, `difficulty` in (easy, medium, hard)
- RecipeIngredient `quantity` > 0, `unit` NOT NULL; composite primary key (`recipeId`, `ingredientId`)
- Recipe requires a valid `categoryId` (FK, NOT NULL)

## Status codes
| Code | Meaning |
|---|---|
| 200 | OK (read / update) |
| 201 | Created |
| 204 | Deleted (no body) |
| 400 | Validation error, bad query param, malformed JSON |
| 404 | Record (or referenced category/ingredient) not found |
| 409 | Unique violation, FK conflict, or delete blocked (category has recipes / ingredient in use) |
| 500 | Unexpected server error |

Validation error example (400):
```json
{ "error": "Validation failed", "details": [{ "field": "prepTime", "message": "prepTime must be at least 1 minute" }] }
```

## Endpoints

### Categories (`/api/categories`)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/categories` | list all |
| GET | `/api/categories/:id` | includes its recipes |
| POST | `/api/categories` | 201 |
| PUT | `/api/categories/:id` | 200 |
| DELETE | `/api/categories/:id` | 204, or 409 if recipes exist |

```json
POST /api/categories
{ "name": "Snacks", "description": "Quick bites" }
```

### Ingredients (`/api/ingredients`)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/ingredients?search=to` | optional name search (`LIKE`) |
| GET | `/api/ingredients/:id` | |
| POST | `/api/ingredients` | 201 |
| PUT | `/api/ingredients/:id` | 200 |
| DELETE | `/api/ingredients/:id` | 204, or 409 if used in a recipe |

```json
POST /api/ingredients
{ "name": "Cumin", "defaultUnit": "g" }
```

### Recipes (`/api/recipes`)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/recipes` | advanced filtering, see below |
| GET | `/api/recipes/:id` | with category + ingredients (quantity, unit) |
| POST | `/api/recipes` | create with ingredients, in one transaction |
| PUT | `/api/recipes/:id` | partial update; if `ingredients` is sent it **replaces** the list |
| DELETE | `/api/recipes/:id` | 204 |
| POST | `/api/recipes/:id/ingredients` | add an ingredient or update its quantity (201 if new, 200 if updated) |
| DELETE | `/api/recipes/:id/ingredients/:ingredientId` | 204 / 404 |

**Advanced filtering**: `GET /api/recipes?category=2&maxTime=30&difficulty=easy&search=pasta&ingredient=tomato&sort=prepTime&order=ASC&page=1&limit=10`

| Param | Behaviour |
|---|---|
| `category` | exact category id |
| `maxTime` | `prepTime <= value` (`Op.lte`) |
| `difficulty` | easy / medium / hard |
| `search` | `LIKE` on title or instructions (`Op.or`, `Op.like`) |
| `ingredient` | recipes containing an ingredient whose name matches |
| `sort` / `order` | title, prepTime, servings, createdAt / ASC, DESC |
| `page` / `limit` | pagination (limit max 100); response is `{ total, page, limit, data }` |

```json
POST /api/recipes
{
  "title": "Lemon Rice",
  "instructions": "Cook rice, temper with spices, mix in lemon juice.",
  "prepTime": 25,
  "servings": 2,
  "difficulty": "easy",
  "categoryId": 2,
  "ingredients": [
    { "ingredientId": 13, "quantity": 200, "unit": "g" },
    { "ingredientId": 15, "quantity": 2 }
  ]
}
```
If `unit` is omitted, the ingredient's `defaultUnit` is used.

```json
POST /api/recipes/9/ingredients
{ "ingredientId": 16, "quantity": 3, "unit": "g" }
```

### Shopping list: raw SQL (`POST /api/shopping-list`)
Consolidates the ingredients of several recipes (`SUM` + `GROUP BY`, parameterised with replacements).
```json
Request:  { "recipeIds": [1, 3, 5] }

Response 200:
{
  "recipeIds": [1, 3, 5],
  "itemCount": 12,
  "items": [
    { "ingredientId": 4, "name": "Butter", "unit": "g", "totalQuantity": 60, "usedInRecipes": 2 }
  ]
}
```
Errors: 400 (empty / non-integer ids), 404 (no ingredients found).

## For ISA-III (React)
CORS is enabled, so the React app can call `http://localhost:5000/api/...` directly.
