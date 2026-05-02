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
  customDescription?: string;
  customLink?: string;
  [key: string]: string | undefined;
};

const ingredientAliases: Record<string, string[]> = {
  mutton: ["mutton", "lamb", "goat"],
  capsicum: ["capsicum", "bell pepper", "pepper"],
  brinjal: ["brinjal", "eggplant", "aubergine"],
  curd: ["curd", "yogurt", "yoghurt"],
  coriander: ["coriander", "cilantro"],
  chana: ["chana", "chickpea", "chickpeas"],
  aloo: ["aloo", "potato"],
  paneer: ["paneer", "cottage cheese"],
};

const muttonRecipeIdeas: Meal[] = [
  {
    idMeal: "idea-mutton-rogan-josh",
    strMeal: "Mutton Rogan Josh",
    strMealThumb: "https://www.themealdb.com/images/media/meals/vvstvq1487342592.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Kashmiri-style mutton simmered with yogurt, browned onions, fennel, ginger, and warming spices.",
    customLink: "https://www.google.com/search?q=Indian+mutton+rogan+josh+recipe",
  },
  {
    idMeal: "idea-mutton-biryani",
    strMeal: "Mutton Biryani",
    strMealThumb: "https://www.themealdb.com/images/media/meals/xrttsx1487339558.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Fragrant basmati rice layered with spiced mutton, mint, fried onions, saffron, and slow dum cooking.",
    customLink: "https://www.google.com/search?q=Indian+mutton+biryani+recipe",
  },
  {
    idMeal: "idea-mutton-curry",
    strMeal: "Mutton Curry",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1529446352.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Homestyle Indian mutton curry cooked with onion, tomato, ginger-garlic paste, garam masala, and coriander.",
    customLink: "https://www.google.com/search?q=Indian+mutton+curry+recipe",
  },
  {
    idMeal: "idea-mutton-keema",
    strMeal: "Mutton Keema Masala",
    strMealThumb: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Minced mutton sautéed with peas, onions, tomatoes, green chillies, and whole spices for a rich masala.",
    customLink: "https://www.google.com/search?q=Indian+mutton+keema+masala+recipe",
  },
  {
    idMeal: "idea-mutton-korma",
    strMeal: "Mutton Korma",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1529446352.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Tender mutton in a creamy cashew-yogurt gravy with cardamom, cloves, cinnamon, and gentle heat.",
    customLink: "https://www.google.com/search?q=Indian+mutton+korma+recipe",
  },
  {
    idMeal: "idea-mutton-pepper-fry",
    strMeal: "Mutton Pepper Fry",
    strMealThumb: "https://www.themealdb.com/images/media/meals/vvstvq1487342592.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "South Indian dry-style mutton tossed with crushed black pepper, curry leaves, coconut, and roasted spices.",
    customLink: "https://www.google.com/search?q=Indian+mutton+pepper+fry+recipe",
  },
  {
    idMeal: "idea-mutton-sukka",
    strMeal: "Mutton Sukka",
    strMealThumb: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "A dry coastal-style mutton dish with roasted coconut, curry leaves, chilli, coriander, and garam masala.",
    customLink: "https://www.google.com/search?q=Indian+mutton+sukka+recipe",
  },
  {
    idMeal: "idea-mutton-do-pyaza",
    strMeal: "Mutton Do Pyaza",
    strMealThumb: "https://www.themealdb.com/images/media/meals/1529446352.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Mutton cooked with onions added two ways for sweetness, texture, and a thick restaurant-style gravy.",
    customLink: "https://www.google.com/search?q=Indian+mutton+do+pyaza+recipe",
  },
  {
    idMeal: "idea-mutton-saagwala",
    strMeal: "Mutton Saagwala",
    strMealThumb: "https://www.themealdb.com/images/media/meals/vvstvq1487342592.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Slow-cooked mutton folded into spiced spinach gravy with garlic, green chilli, cumin, and cream.",
    customLink: "https://www.google.com/search?q=Indian+mutton+saagwala+recipe",
  },
  {
    idMeal: "idea-mutton-kheema-pav",
    strMeal: "Mutton Kheema Pav",
    strMealThumb: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Mumbai-style spiced mutton mince finished with butter, coriander, lime, and served with toasted pav.",
    customLink: "https://www.google.com/search?q=Indian+mutton+kheema+pav+recipe",
  },
];

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const buildIngredientRecipeIdeas = (wanted: string[]): Meal[] => {
  const clean = wanted.map((item) => item.trim().toLowerCase()).filter(Boolean);
  const display = clean.map(titleCase).join(" & ");
  const ingredientText = display.toLowerCase();
  const idBase = clean.join("-").replace(/[^a-z0-9-]/g, "-");
  const searchBase = encodeURIComponent(`Indian ${ingredientText} recipe`);
  const photo = clean.some((item) => ["chicken", "mutton", "lamb", "goat"].includes(item))
    ? "https://www.themealdb.com/images/media/meals/1529446352.jpg"
    : "https://www.themealdb.com/images/media/meals/urtpqw1487341253.jpg";

  const templates = [
    ["Masala Curry", `A rich Indian curry built around ${ingredientText}, onion, tomato, ginger-garlic paste, and garam masala.`],
    ["Korma", `A creamy ${ingredientText} korma cooked with yogurt, cashew paste, cardamom, cloves, and mild spices.`],
    ["Biryani", `Layered basmati rice with ${ingredientText}, mint, fried onions, saffron, and warm biryani spices.`],
    ["Tikka Masala", `${display} marinated with yogurt and spices, then simmered in a smoky tomato-butter masala.`],
    ["Do Pyaza", `${display} cooked with onions added in two stages for a sweet, thick, restaurant-style gravy.`],
    ["Pepper Fry", `A dry-style ${ingredientText} fry tossed with black pepper, curry leaves, cumin, and coriander.`],
    ["Saagwala", `${display} folded into a spiced spinach gravy with garlic, green chilli, cumin, and cream.`],
    ["Jalfrezi", `A quick wok-style ${ingredientText} dish with capsicum, onion, tomato, and tangy Indian spices.`],
    ["Vindaloo", `A bold, tangy ${ingredientText} curry with chilli, vinegar, garlic, cumin, and deep roasted spices.`],
    ["Pulao", `A one-pot Indian pulao with ${ingredientText}, basmati rice, whole spices, herbs, and fried onions.`],
  ];

  return templates.map(([suffix, description], index) => ({
    idMeal: `idea-${idBase}-${index}`,
    strMeal: `${display} ${suffix}`,
    strMealThumb: photo,
    strCategory: display,
    strArea: "India",
    customDescription: description,
    customLink: `https://www.google.com/search?q=${searchBase}+${encodeURIComponent(suffix.toLowerCase())}`,
  }));
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
      // Fetch all Indian meals once, then filter locally by ingredient text.
      // TheMealDB's filter.php only tags one main ingredient per meal, so
      // intersecting strict ingredient filters returns almost nothing.
      const indianRes = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=India`
      ).catch(() => null);

      if (!indianRes || !indianRes.ok) {
        throw new Error("Failed to load Indian recipes");
      }

      const indianData = await indianRes.json();
      const indianMeals: Meal[] = indianData.meals ?? [];

      // Fetch full details for every Indian meal so we can match all ingredients.
      const allDetailed = await Promise.all(
        indianMeals.map((m) =>
          fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`)
            .then((r) => r.json())
            .then((d) => (d.meals?.[0] as Meal) ?? null)
            .catch(() => null)
        )
      );

      const ingredientsOf = (m: Meal): string[] => {
        const out: string[] = [];
        for (let i = 1; i <= 20; i++) {
          const v = m[`strIngredient${i}`];
          if (v && v.trim()) out.push(v.toLowerCase());
        }
        return out;
      };

      const wanted = list.map((i) => i.toLowerCase());
      const wantedTerms = wanted.map((w) => ingredientAliases[w] ?? [w]);

      // Score each meal: matches in ingredients OR in the title/instructions.
      const validMeals = allDetailed.filter((m): m is Meal => !!m);
      const scored = validMeals
        .map((m) => {
          const mealIngs = ingredientsOf(m);
          const haystack = [
            m.strMeal,
            m.strCategory,
            m.strInstructions,
            ...mealIngs,
          ]
            .join(" ")
            .toLowerCase();
          const matches = wantedTerms.filter((terms) =>
            terms.some(
              (term) =>
                mealIngs.some((mi) => mi.includes(term) || term.includes(mi)) ||
                haystack.includes(term)
            )
          ).length;
          return { meal: m, matches };
        })
        .sort((a, b) => b.matches - a.matches);

      // Show only relevant recipes. For mutton, TheMealDB has very few Indian matches,
      // so add Indian mutton recipe ideas instead of unrelated filler dishes.
      const matched = scored.filter((x) => x.matches > 0).map((x) => x.meal);
      const shouldAddMuttonIdeas = wanted.some((w) => w === "mutton");
      const muttonFillers = shouldAddMuttonIdeas
        ? muttonRecipeIdeas.filter(
            (idea) => !matched.some((meal) => meal.strMeal.toLowerCase() === idea.strMeal.toLowerCase())
          )
        : [];
      const detailed = [...matched, ...muttonFillers].slice(0, 10);

      setRecipes(detailed);
      if (detailed.length === 0) {
        toast({
          title: "No matching Indian recipes found",
          description: "Try another ingredient like chicken, paneer, potato, mutton, or lentils.",
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
              const link = r.strSource || r.strYoutube || r.customLink;
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
                      <p className="text-sm text-muted-foreground">{r.customDescription || shortDesc(r.strInstructions)}</p>
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
