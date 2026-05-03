import { useState } from "react";
import { Search, ExternalLink, Loader2, UtensilsCrossed, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  customIngredients?: string[];
  [key: string]: string | string[] | undefined;
};

function commonsImage(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=640`;
}

function normalizeRecipeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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
    strMealThumb: commonsImage("Roghan_Josh.jpg"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Kashmiri-style mutton simmered with yogurt, browned onions, fennel, ginger, and warming spices.",
    customLink: "https://www.google.com/search?q=Indian+mutton+rogan+josh+recipe",
  },
  {
    idMeal: "idea-mutton-biryani",
    strMeal: "Mutton Biryani",
    strMealThumb: commonsImage("Mutton_biryani.JPG"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Fragrant basmati rice layered with spiced mutton, mint, fried onions, saffron, and slow dum cooking.",
    customLink: "https://www.google.com/search?q=Indian+mutton+biryani+recipe",
  },
  {
    idMeal: "idea-mutton-curry",
    strMeal: "Mutton Curry",
    strMealThumb: commonsImage("Odia_Mutton_Curry_(Mansha_Tarkari).jpg"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Homestyle Indian mutton curry cooked with onion, tomato, ginger-garlic paste, garam masala, and coriander.",
    customLink: "https://www.google.com/search?q=Indian+mutton+curry+recipe",
  },
  {
    idMeal: "idea-mutton-keema",
    strMeal: "Mutton Keema Masala",
    strMealThumb: commonsImage("Keema_matar.jpg"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Minced mutton sautéed with peas, onions, tomatoes, green chillies, and whole spices for a rich masala.",
    customLink: "https://www.google.com/search?q=Indian+mutton+keema+masala+recipe",
  },
  {
    idMeal: "idea-mutton-korma",
    strMeal: "Mutton Korma",
    strMealThumb: commonsImage("Mutton_korma.JPG"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Tender mutton in a creamy cashew-yogurt gravy with cardamom, cloves, cinnamon, and gentle heat.",
    customLink: "https://www.google.com/search?q=Indian+mutton+korma+recipe",
  },
  {
    idMeal: "idea-mutton-pepper-fry",
    strMeal: "Mutton Pepper Fry",
    strMealThumb: commonsImage("Mutton_chukka.jpg"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "South Indian dry-style mutton tossed with crushed black pepper, curry leaves, coconut, and roasted spices.",
    customLink: "https://www.google.com/search?q=Indian+mutton+pepper+fry+recipe",
  },
  {
    idMeal: "idea-mutton-sukka",
    strMeal: "Mutton Sukka",
    strMealThumb: commonsImage("Mutton_chukka.jpg"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "A dry coastal-style mutton dish with roasted coconut, curry leaves, chilli, coriander, and garam masala.",
    customLink: "https://www.google.com/search?q=Indian+mutton+sukka+recipe",
  },
  {
    idMeal: "idea-mutton-do-pyaza",
    strMeal: "Mutton Do Pyaza",
    strMealThumb: commonsImage("Mutton_Curry_1.jpg"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Mutton cooked with onions added two ways for sweetness, texture, and a thick restaurant-style gravy.",
    customLink: "https://www.google.com/search?q=Indian+mutton+do+pyaza+recipe",
  },
  {
    idMeal: "idea-mutton-saagwala",
    strMeal: "Mutton Saagwala",
    strMealThumb: commonsImage("Saag_gosht.jpg"),
    strCategory: "Mutton",
    strArea: "India",
    customDescription: "Slow-cooked mutton folded into spiced spinach gravy with garlic, green chilli, cumin, and cream.",
    customLink: "https://www.google.com/search?q=Indian+mutton+saagwala+recipe",
  },
  {
    idMeal: "idea-mutton-kheema-pav",
    strMeal: "Mutton Kheema Pav",
    strMealThumb: commonsImage("Keema_pav.jpg"),
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
  const photoBySuffix: Record<string, string> = clean.some((item) => item.includes("chicken"))
    ? {
        "Masala Curry": commonsImage("Chicken_curry.jpg"),
        Korma: commonsImage("Chicken_Korma.JPG"),
        Biryani: commonsImage("Chicken_biriyani-_My_cafe_restaurant_-_Meghalaya_DSC_009.jpg"),
        "Tikka Masala": commonsImage("Chicken_Tikka_Masala_KellySue.JPG"),
        "Do Pyaza": commonsImage("Chicken_Dopiaza.jpg"),
        "Pepper Fry": commonsImage("Chicken_fry.jpg"),
        Saagwala: commonsImage("Saag_chicken.jpg"),
        Jalfrezi: commonsImage("Chicken_Jalfrezi.jpg"),
        Vindaloo: commonsImage("Chicken_Vindaloo.jpg"),
        Pulao: commonsImage("Chicken_pulao.jpg"),
      }
    : {
        "Masala Curry": commonsImage("Paneer_butter_masala_2.jpg"),
        Korma: commonsImage("Paneer_Korma_with_Gravy.jpg"),
        Biryani: commonsImage("Panner_Vegetable_Hyderabad_Biryani.jpg"),
        "Tikka Masala": commonsImage("Paneer_Tikka_Masala.jpg"),
        "Do Pyaza": commonsImage("Paneer_Do_Pyaza.jpg"),
        "Pepper Fry": commonsImage("Paneer_65.jpg"),
        Saagwala: commonsImage("Palakpaneer_Rayagada_Odisha_0009.jpg"),
        Jalfrezi: commonsImage("Paneer_Jalfrezi.jpg"),
        Vindaloo: commonsImage("Vegetable_Vindaloo.jpg"),
        Pulao: commonsImage("Paneer_pulao.jpg"),
      };

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
    strMealThumb: photoBySuffix[suffix] ?? getDishPhoto(`${display} ${suffix}`),
    strCategory: display,
    strArea: "India",
    customDescription: description,
    customLink: `https://www.google.com/search?q=${searchBase}+${encodeURIComponent(suffix.toLowerCase())}`,
  }));
};

type CategoryKey = "veg" | "nonveg" | "dessert" | "snacks";

// Per-dish image URLs (Wikimedia Commons Special:FilePath resolves reliably to the current image file).
const dishPhotos: Record<string, string> = {
  // Veg
  "paneer-butter-masala": commonsImage("Paneer_butter_masala_2.jpg"),
  "palak-paneer": commonsImage("Palakpaneer_Rayagada_Odisha_0009.jpg"),
  "chana-masala": commonsImage("Chana_Masala_-_Mohammed_-_Spice_Of_Life_2024-05-27.jpg"),
  "dal-makhani": commonsImage("Dal_Makhani.jpg"),
  "aloo-gobi": commonsImage("Aloo_gobi.jpg"),
  "baingan-bharta": commonsImage("Baingan_Ka_Bhurta.JPG"),
  "rajma": commonsImage("Rajma_Masala_(32081557778).jpg"),
  "veg-biryani": commonsImage("Vegetable_Biryani_IMG_001.jpg"),
  "malai-kofta": commonsImage("Malai_Kofta_Curry.jpg"),
  "bhindi-masala": commonsImage("Bhindi_Masala.jpg"),
  // Non-Veg
  "butter-chicken": commonsImage("Chicken_makhani.jpg"),
  "chicken-tikka-masala": commonsImage("Chicken_Tikka_Masala_KellySue.JPG"),
  "chicken-biryani": commonsImage("Chicken_biriyani-_My_cafe_restaurant_-_Meghalaya_DSC_009.jpg"),
  "mutton-rogan-josh": commonsImage("Roghan_Josh.jpg"),
  "mutton-curry": commonsImage("Odia_Mutton_Curry_(Mansha_Tarkari).jpg"),
  "chicken-chettinad": commonsImage("Chicken_Chettinad.jpg"),
  "fish-curry": commonsImage("Goan_Fish_Curry.jpg"),
  "prawn-masala": commonsImage("Prawn_curry_with_rice.jpg"),
  "chicken-korma": commonsImage("Chicken_Korma.JPG"),
  "egg-curry": commonsImage("Egg_curry_-_Kerala_cuisine.jpg"),
  // Dessert
  "gulab-jamun": commonsImage("Two_Gulab_Jamun_in_a_plate_01.jpg"),
  "rasgulla": commonsImage("Rasgulla.jpg"),
  "rasmalai": commonsImage("Ras_Malai_-_Closeup.JPG"),
  "kheer": commonsImage("Rice_kheer.jpg"),
  "gajar-halwa": commonsImage("Gajar_Halwa.JPG"),
  "jalebi": commonsImage("Jalebi_-_Kolkata_2011-10-08_5995.JPG"),
  "kulfi": commonsImage("Matka_Kulfi.jpg"),
  "besan-ladoo": commonsImage("Besan_Ladoo.jpg"),
  "mysore-pak": commonsImage("Mysore_Pak_from_Sri_Krishna_Sweets.jpg"),
  "kaju-katli": commonsImage("Kaju_Barfi.JPG"),
  // Snacks
  "veg-sandwich": commonsImage("Bombay_sandwich.jpg"),
  "grilled-cheese-chutney-sandwich": commonsImage("Grilled_cheese_sandwich.jpg"),
  "aloo-tikki-burger": commonsImage("McAloo_Tikki_Burger.jpg"),
  "paneer-burger": commonsImage("Paneer_Burger.jpg"),
  "masala-pasta": commonsImage("Masala_pasta.jpg"),
  "schezwan-pasta": commonsImage("Schezwan_pasta.jpg"),
  "veg-cutlet": commonsImage("Vegetable_cutlet.jpg"),
  "samosa": commonsImage("Samosa_4.jpg"),
  "pav-bhaji": commonsImage("Bhaji_pav_2.jpg"),
  "vada-pav": commonsImage("Vada_Pav-2.jpg"),
};

const FALLBACK_PHOTO = commonsImage("Indian_Food.jpg");

function getDishPhoto(name: string) {
  return dishPhotos[normalizeRecipeKey(name)] ?? FALLBACK_PHOTO;
}

const makeIdea = (
  key: string,
  name: string,
  _unused: string,
  category: string,
  description: string,
): Meal => ({
  idMeal: `idea-${key}`,
  strMeal: name,
  strMealThumb: dishPhotos[key] ?? getDishPhoto(name),
  strCategory: category,
  strArea: "India",
  customDescription: description,
  customLink: `https://www.google.com/search?q=${encodeURIComponent("Indian " + name + " recipe")}`,
});

const VEG_PHOTO = FALLBACK_PHOTO;
const NONVEG_PHOTO = FALLBACK_PHOTO;
const DESSERT_PHOTO = FALLBACK_PHOTO;
const SNACK_PHOTO = FALLBACK_PHOTO;

const categoryRecipes: Record<CategoryKey, Meal[]> = {
  veg: [
    makeIdea("paneer-butter-masala", "Paneer Butter Masala", VEG_PHOTO, "Veg", "Soft paneer cubes simmered in a creamy tomato-cashew gravy with butter and warm spices."),
    makeIdea("palak-paneer", "Palak Paneer", VEG_PHOTO, "Veg", "Spinach puree cooked with paneer, garlic, green chilli, cumin, and a touch of cream."),
    makeIdea("chana-masala", "Chana Masala", VEG_PHOTO, "Veg", "Chickpeas in a tangy onion-tomato gravy spiced with garam masala, amchur, and coriander."),
    makeIdea("dal-makhani", "Dal Makhani", VEG_PHOTO, "Veg", "Slow-cooked black lentils and rajma finished with butter, cream, and smoky tadka."),
    makeIdea("aloo-gobi", "Aloo Gobi", VEG_PHOTO, "Veg", "Dry-style potato and cauliflower stir-fry with turmeric, cumin, ginger, and coriander."),
    makeIdea("baingan-bharta", "Baingan Bharta", VEG_PHOTO, "Veg", "Smoky roasted eggplant mashed with onion, tomato, green chilli, garlic, and spices."),
    makeIdea("rajma", "Rajma Masala", VEG_PHOTO, "Veg", "Kidney beans simmered in an onion-tomato Punjabi gravy with garam masala and ginger."),
    makeIdea("veg-biryani", "Vegetable Biryani", VEG_PHOTO, "Veg", "Basmati rice layered with mixed vegetables, mint, fried onions, and biryani spices."),
    makeIdea("malai-kofta", "Malai Kofta", VEG_PHOTO, "Veg", "Paneer-potato koftas in a rich, mildly sweet cashew and tomato cream gravy."),
    makeIdea("bhindi-masala", "Bhindi Masala", VEG_PHOTO, "Veg", "Okra sautéed with onions, tomatoes, and dry spices for a quick North Indian side."),
  ],
  nonveg: [
    makeIdea("butter-chicken", "Butter Chicken", NONVEG_PHOTO, "Non-Veg", "Tandoori chicken in a silky tomato-butter gravy with cream, fenugreek, and garam masala."),
    makeIdea("chicken-tikka-masala", "Chicken Tikka Masala", NONVEG_PHOTO, "Non-Veg", "Charred chicken tikka simmered in a smoky, spiced tomato and onion masala."),
    makeIdea("chicken-biryani", "Chicken Biryani", NONVEG_PHOTO, "Non-Veg", "Layered basmati rice with marinated chicken, mint, saffron, and fried onions."),
    makeIdea("mutton-rogan-josh", "Mutton Rogan Josh", NONVEG_PHOTO, "Non-Veg", "Kashmiri-style mutton with yogurt, browned onions, fennel, ginger, and warming spices."),
    makeIdea("mutton-curry", "Mutton Curry", NONVEG_PHOTO, "Non-Veg", "Homestyle Indian mutton curry with onion, tomato, ginger-garlic, and garam masala."),
    makeIdea("chicken-chettinad", "Chicken Chettinad", NONVEG_PHOTO, "Non-Veg", "Fiery South Indian chicken with roasted spices, coconut, curry leaves, and pepper."),
    makeIdea("fish-curry", "Goan Fish Curry", NONVEG_PHOTO, "Non-Veg", "Tangy coconut-based fish curry with kokum, chilli, turmeric, and coriander."),
    makeIdea("prawn-masala", "Prawn Masala", NONVEG_PHOTO, "Non-Veg", "Prawns sautéed in a spiced onion-tomato masala with garlic, ginger, and coriander."),
    makeIdea("chicken-korma", "Chicken Korma", NONVEG_PHOTO, "Non-Veg", "Mild, creamy chicken in a cashew-yogurt gravy with cardamom, cloves, and cinnamon."),
    makeIdea("egg-curry", "Egg Curry", NONVEG_PHOTO, "Non-Veg", "Boiled eggs simmered in a spiced onion-tomato masala with cumin and garam masala."),
  ],
  dessert: [
    makeIdea("gulab-jamun", "Gulab Jamun", DESSERT_PHOTO, "Dessert", "Soft khoya dumplings deep-fried and soaked in cardamom and rose-scented sugar syrup."),
    makeIdea("rasgulla", "Rasgulla", DESSERT_PHOTO, "Dessert", "Spongy chenna balls cooked in light sugar syrup — a classic Bengali sweet."),
    makeIdea("rasmalai", "Rasmalai", DESSERT_PHOTO, "Dessert", "Soft chenna patties soaked in saffron-cardamom thickened milk with pistachios."),
    makeIdea("kheer", "Rice Kheer", DESSERT_PHOTO, "Dessert", "Slow-simmered rice pudding with milk, sugar, cardamom, saffron, and dry fruits."),
    makeIdea("gajar-halwa", "Gajar ka Halwa", DESSERT_PHOTO, "Dessert", "Grated carrots cooked with milk, ghee, sugar, cardamom, and topped with nuts."),
    makeIdea("jalebi", "Jalebi", DESSERT_PHOTO, "Dessert", "Crisp fermented batter swirls fried golden and dunked in saffron sugar syrup."),
    makeIdea("kulfi", "Kulfi", DESSERT_PHOTO, "Dessert", "Dense Indian frozen dessert with reduced milk, cardamom, saffron, and pistachios."),
    makeIdea("besan-ladoo", "Besan Ladoo", DESSERT_PHOTO, "Dessert", "Roasted gram flour mixed with ghee, sugar, and cardamom, rolled into rich ladoos."),
    makeIdea("mysore-pak", "Mysore Pak", DESSERT_PHOTO, "Dessert", "South Indian sweet of besan, ghee, and sugar cooked to a melt-in-mouth texture."),
    makeIdea("kaju-katli", "Kaju Katli", DESSERT_PHOTO, "Dessert", "Smooth cashew fudge diamonds with sugar and a hint of cardamom, topped with silver leaf."),
  ],
  snacks: [
    makeIdea("veg-sandwich", "Bombay Veg Sandwich", SNACK_PHOTO, "Snacks", "Layered sandwich with potato, cucumber, tomato, onion, green chutney, and butter."),
    makeIdea("grilled-cheese-chutney-sandwich", "Grilled Cheese Chutney Sandwich", SNACK_PHOTO, "Snacks", "Grilled sandwich loaded with cheese, mint-coriander chutney, and Indian masala."),
    makeIdea("aloo-tikki-burger", "Aloo Tikki Burger", SNACK_PHOTO, "Snacks", "Spiced potato patty in a soft bun with chutneys, onion, and crisp lettuce."),
    makeIdea("paneer-burger", "Paneer Tikka Burger", SNACK_PHOTO, "Snacks", "Marinated paneer tikka patty in a bun with mint mayo, onion, and tomato."),
    makeIdea("masala-pasta", "Indian Masala Pasta", SNACK_PHOTO, "Snacks", "Penne tossed in a spiced tomato-onion masala with capsicum, herbs, and cheese."),
    makeIdea("schezwan-pasta", "Schezwan Pasta", SNACK_PHOTO, "Snacks", "Indo-Chinese pasta tossed in fiery schezwan sauce with veggies and spring onion."),
    makeIdea("veg-cutlet", "Veg Cutlet", SNACK_PHOTO, "Snacks", "Crisp breadcrumb-coated patties of mashed potato, peas, carrots, and Indian spices."),
    makeIdea("samosa", "Samosa", SNACK_PHOTO, "Snacks", "Flaky pastry filled with spiced potatoes and peas, deep-fried until golden."),
    makeIdea("pav-bhaji", "Pav Bhaji", SNACK_PHOTO, "Snacks", "Mashed mixed-veg curry with butter and pav bhaji masala, served with toasted pav."),
    makeIdea("vada-pav", "Vada Pav", SNACK_PHOTO, "Snacks", "Spiced potato vada in a pav bun with garlic chutney and fried green chilli."),
  ],
};

const categoryLabel: Record<CategoryKey, string> = {
  veg: "Veg",
  nonveg: "Non-Veg",
  dessert: "Dessert",
  snacks: "Snacks",
};

const Index = () => {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const defaultIdeas: Meal[] = [
    ...categoryRecipes.veg,
    ...categoryRecipes.nonveg,
    ...categoryRecipes.snacks,
    ...categoryRecipes.dessert,
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const list = ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    if (list.length === 0) {
      setRecipes(defaultIdeas);
      setPage(1);
      setSearched(true);
      toast({ title: "Showing popular Indian recipes", description: "Add ingredients to refine results." });
      return;
    }

    setLoading(true);
    setSearched(true);
    setPage(1);
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
          if (typeof v === "string" && v.trim()) out.push(v.toLowerCase());
        }
        return out;
      };

      const wanted = list.map((i) => i.toLowerCase());
      const wantedTerms = wanted.map((w) => ingredientAliases[w] ?? [w]);

      // Score each meal using only its title and main ingredients so unrelated
      // recipes are not picked just because the instructions mention the ingredient.
      const validMeals = allDetailed.filter((m): m is Meal => !!m);
      const scored = validMeals
        .map((m) => {
          const mealIngs = ingredientsOf(m);
          const recipeIdentity = [m.strMeal, ...mealIngs.slice(0, 2)]
            .join(" ")
            .toLowerCase();
          const matches = wantedTerms.filter((terms) =>
            terms.some(
              (term) =>
                mealIngs.some((mi) => mi.includes(term) || term.includes(mi)) ||
                recipeIdentity.includes(term)
            )
          ).length;
          return { meal: m, matches };
        })
        .sort((a, b) => b.matches - a.matches);

      // Show only relevant recipes. For mutton, TheMealDB has very few Indian matches,
      // so add Indian mutton recipe ideas instead of unrelated filler dishes.
      const matched = scored.filter((x) => x.matches > 0).map((x) => x.meal);
      const shouldAddMuttonIdeas = wanted.some((w) => w === "mutton");
      const baseIdeas = shouldAddMuttonIdeas ? muttonRecipeIdeas : buildIngredientRecipeIdeas(wanted);
      const ideaFillers = [...baseIdeas, ...defaultIdeas].filter(
        (idea) => !matched.some((meal) => meal.strMeal.toLowerCase() === idea.strMeal.toLowerCase())
      );
      const detailed = [...matched, ...ideaFillers];

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

  const totalPages = Math.max(1, Math.ceil(recipes.length / PAGE_SIZE));
  const pagedRecipes = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            pagedRecipes.map((r) => {
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
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fallback !== "1") {
                          img.dataset.fallback = "1";
                          img.src = FALLBACK_PHOTO;
                        }
                      }}
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

          {!loading && recipes.length > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={page === 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-xl"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-xl bg-[var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
              >
                Next 10 recipes
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Index;
