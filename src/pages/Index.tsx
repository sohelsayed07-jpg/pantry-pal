import { useState } from "react";
import { Search, ExternalLink, Loader2, UtensilsCrossed, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strSource?: string;
  strYoutube?: string;
};

const Index = () => {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const list = ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    if (list.length === 0) {
      toast({ title: "Add an ingredient", description: "Try chicken, carrot, capsicum…" });
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      // Fetch Indian meals + each ingredient filter, then intersect on idMeal.
      const indianPromise = fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian`
      )
        .then((r) => r.json())
        .then((d) => (d.meals as Meal[] | null) ?? []);

      const ingredientPromises = Promise.all(
        list.map((ing) =>
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`)
            .then((r) => r.json())
            .then((d) => (d.meals as Meal[] | null) ?? [])
        )
      );

      const [indianMeals, ingredientResults] = await Promise.all([
        indianPromise,
        ingredientPromises,
      ]);

      const indianIds = new Set(indianMeals.map((m) => m.idMeal));
      let intersected = (ingredientResults[0] ?? []).filter((m) => indianIds.has(m.idMeal));
      for (let i = 1; i < ingredientResults.length; i++) {
        const ids = new Set(ingredientResults[i].map((m) => m.idMeal));
        intersected = intersected.filter((m) => ids.has(m.idMeal));
      }

      const top = intersected.slice(0, 10);

      // Fetch full details for each (for description + link)
      const detailed = await Promise.all(
        top.map((m) =>
          fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`)
            .then((r) => r.json())
            .then((d) => (d.meals?.[0] as Meal) ?? m)
        )
      );

      setRecipes(detailed);
      if (detailed.length === 0) {
        toast({
          title: "No Indian recipes found",
          description: "Try common ingredients like chicken, paneer, potato, or lentils.",
        });
      }
    } catch (err) {
      toast({ title: "Something went wrong", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const shortDesc = (text?: string) =>
    text ? text.replace(/\s+/g, " ").trim().slice(0, 140) + (text.length > 140 ? "…" : "") : "";

  return (
    <main className="min-h-screen bg-[var(--gradient-soft)]">
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:pt-14">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gradient-warm)] shadow-[var(--shadow-soft)]">
            <Flame className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What Indian dish to cook?
          </h1>
          <p className="mt-2 text-muted-foreground">
            Type the ingredients you have. We'll suggest authentic Indian recipes.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="rounded-2xl border bg-card p-3 shadow-[var(--shadow-card)] sm:p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="paneer, tomato, onion"
                className="h-12 rounded-xl border-0 bg-secondary pl-10 text-base focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Ingredients"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-[var(--gradient-warm)] px-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Find recipes"}
            </Button>
          </div>
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            Separate ingredients with commas.
          </p>
        </form>

        <section className="mt-8 space-y-4" aria-live="polite">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Cooking up suggestions…</p>
            </div>
          )}

          {!loading && searched && recipes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              <UtensilsCrossed className="h-8 w-8" />
              <p className="px-6">No recipes match all those ingredients. Try fewer or more common ones.</p>
            </div>
          )}

          {!loading &&
            recipes.map((r) => {
              const link = r.strSource || r.strYoutube;
              return (
                <Card
                  key={r.idMeal}
                  className="overflow-hidden rounded-2xl border-0 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row">
                    <img
                      src={r.strMealThumb}
                      alt={r.strMeal}
                      loading="lazy"
                      className="h-48 w-full object-cover sm:h-auto sm:w-40 sm:shrink-0"
                    />
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {r.strCategory && (
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                            {r.strCategory}
                          </span>
                        )}
                        {r.strArea && (
                          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                            {r.strArea}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold leading-tight">{r.strMeal}</h2>
                      <p className="text-sm text-muted-foreground">{shortDesc(r.strInstructions)}</p>
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          View full recipe <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
        </section>
      </div>
    </main>
  );
};

export default Index;
