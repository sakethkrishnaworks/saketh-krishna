import { CoachingPlan, Consultation, ContactInfo, Cookbook, Course, DietPlan, EventSession, FaqItem, Testimonial } from './types';
import ReadImg from '../assets/read.jpg';

export const CONTACT: ContactInfo = {
  instagram: 'https://instagram.com/sakethkrishna',
  instagramHandle: '@sakethkrishna',
  email: 'sakethkrishna.work@gmail.com',
  whatsapp: '',
};

export const RESTAURANT_CONSULTING = {
  startingPrice: 10000,
  title: 'Restaurant Consulting',
  description: 'Healthy menu engineering for restaurants, cafes, and cloud kitchens — from recipe development to kitchen workflow and cost control.',
  services: [
    'Menu engineering',
    'Recipe development',
    'Healthy menu design',
    'Kitchen workflow',
    'Cost control',
    'Staff training',
  ],
};

export const RECIPE_DEVELOPMENT = {
  priceMin: 3000,
  priceMax: 15000,
  title: 'Recipe Development',
  description: 'Custom healthy recipes for brands, cafes, and products — tested, macro-calculated, and ready to launch.',
  services: [
    'Healthy recipes',
    'Air fryer recipes',
    'Cafe menus',
    'Product recipes',
  ],
};

export const GROCERY_LIST: string[] = [
  'Paneer / tofu',
  'Chicken breast / fish',
  'Eggs',
  'Soya chunks',
  'Dal + rajma + chana',
  'Oats / dalia',
  'Brown rice / millets',
  'Mixed vegetables',
  'Fruits (banana, apple, papaya)',
  'Curd / Greek yogurt',
  'Nuts + peanuts',
  'Whey protein (optional)',
];

export const MEAL_PREP_CHECKLIST: string[] = [
  'Plan 7 days of lunches + dinners',
  'Write the grocery list',
  'Shop + wash produce',
  'Batch cook proteins',
  'Batch cook grains',
  'Roast / steam vegetables',
  'Portion into containers',
  'Label with dates',
];

export const ASSET_IMAGES = {
  readStory: ReadImg.src,
  heroBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaTdW-PfpkERJ0-mOMrP2aF9MBiYJTk6Syk7dIc0WTPeYeiy4H1PcGG804Qu8IN3e6NrwcbrlByu8dx-CT3plT8qEaG4GX2UejTuW8OppQ_7WmDoN91yzMZptaXFijloAnEHWtpdfFDvEjdnn_9BkPh5U1y1tXeSt6_pfFgCm--FovgrdKNzE75Abna8YGn_hbuZzUMFrLe1rJoKR3SSZ7odjIK1eBfrXpKfsKAd3G3MCUhzh_mbcdQAipR4DoEA0jKR0Q4CsZ6IU',
  chefPortrait: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUsaBpb4ljbzqKonoOZDk6RCcarWBfzmMGv5sBRTCRr9YAoEWI2SpGB2Bcotuth5rNb3p1XfL4t2_cDz0j0hSAW3zlfCtu6Cv7zVDCIEcB9HlBMrWpU5EsjNTnQH8PhMMz9BFwX4ZgaHJejDltH1XlZoLcVkJAszk6LVMXHyV1GdFJPxQfGdOAvX4jgQoEYEWRckGfzo0GZO04quh9wiax6pLSIg4CxeZd-LQodAiOJspk-kgHdfJ3gmct4L2PSKu9X3nASUZjOB4',
  veganBlueprint: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBRJnxvdpwYHz7dWg9gWY0lLMqSOsqeNMywTyAl8-yTr1JFVAJbuBvDaOw2NsRua2jK6KvpQBSV5Z7GXqPLqHanFEfvrfobCUVW-7Y7gk91wAHz0xQc1X1D-xKBSL70sH5_XmRgCpanFKw1U8mS0NLVDjKZEF28Yd1lA3HTcR5Z4v-q6VXdmtQtTmGIRkkCeQV7Xib6dHCNQljE4PFOLHiuNkFEUYSV0SKxem4fYl6RGey0D6wT9hTfXMcHNETkyILpxadY93WFVs',
  lean30: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZz88X8pHL36DANdanG1AbCuBQYgfNn1Smgwzrlv5DtspDI87_LWk50jgCo4CwK8h_V4QzjxWLfvS2CAKki6w_-hd6J_5at8ZM0Oix6viV2sJTc5CXNT27GJ6I33_VEiOv4OtY9kodeLs-RCHLhhmHUySVsOMVK8iNhuQkz5LjwJ58yxdgknh4ZeSMYId1vjgWnIYLt-EayH0iXcMbQKob-vYHnKfTWuDYKxPK9XRjYZMGWF38vaABh6kOjyTerBTbAqZgrUUykrk',
  cookbookHeroBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDkkOJByvQ53kMBZT8h80-j5prCnO0xrJGLXu31N110dV-Jys01KnS8RhL2ONGtjvRVSbo0vTVARHG7tIMdqcbV9rZ1NI_8pF7BU9HD1pA4fxca12hLuyEwBylX6-tsJnWxpdv_b-xdPL02nKSlCz7YGDTJGl4wzgMXWpaMGmsGjAu5_pCZBRzfdzCxDQHCXZU4s5dr2FYs53u6XRn0KKXityWe74CiqxN1emooS8bArQijliIHRt4q2uPPc7r8T1g2UYVUS1NjLM',
  teluguKitchen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApJ3PjkxBod3hHtt22pxd6aDPR2GUylMN7tH6KsRiri3PfP13HKwG8Mzfc_AgC5atq31PXFfQjm-koQ1cdC7bzsYx7Rxu9qkY4Np5Oji7xH7m4VUnD6MkM1v0okARKxrSiYQg4CmudYzE956EDmfOoyqSnc_INVgM9Kg-ke_fh2kPcqGKpOIcNpH7t2YfbtbSBQZgIryJFDb6fpopEp5ErTggRpEts_Agpesn7ra7p7aWPWhecXfWwn3U2qgUTGQ33nFZJpQ2afIU',
  airFryerRecipes: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuzJJLfk1dEMIUbRcDrpsC7UmBarFIH9INtsC84h9zTPcBuaR2OtPtZCfFe9ytELE_PpB6OJeatZJijQaTYh80CnXSS36pfyfsbcazwn7RANLRP04by10iSQGQlzUknq2dg5JqLaZG0S1r1cejL6WzKeREDonCDezSyyDCxyZG3JsCzWtbwSeT6T3Ft8sLAl4X3kS1YpDsCaQ89asO3MO3kd2ED9lB_jUjp_pIwSYREvSUd_sg5Vokvv5owFPGnNvurxcuBoj-0lg',
  mealPrepGuide: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyvDgpA1aTLlpsIGJeDdM-6ZF828T6kmT62HyISseVw4C3OR6mp9R0OLJY8dJi6viik4Igvb5xiqBgNLReYL8O4ZN7bbctinD1QqpCbOb8xo86aW0kqG7tQw8-peWp-JrBvvV4zWtz0QOZSwOTJKRVx0j_TOnAsWLrsEEr78_qxzhxoLGPkkwDOlY9PO1JWTGMMBETzyD2ho2zY2zLq7K-4ssA1YOS7uhRRiDXXdUE44Fuo452pAbm9vVvm0EK7j8gC-nHSrVPty4',
  dietPlansHeroBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAarYCQwxm6IRIDqIyAUI0pjry8J3pph1_k8yWuExLaik2CDETiVFhQM_notSMc7vzLXI7qwXT2ul1f2u03qTWgArq0l_Sm31ZrXwGDUHs9kumUDYuO9z4cFDewLFjPIFTyyLv3K5jmTmN3FoekkqYrobOFeHFd5ltx6QHzCRVe-pOQ9Ceb1Cy5vNc_bhTJ5qNdR3cKGNENHwrcEHqYNtWdDo8hRqOt92DYJhpmRuIDFtAGh17YqHpl8Y1-aiBGgb-qy40MwTTkq9c',
  beginnerFatLoss: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBy3CBmPst8HSIB8jzHtnkacut15K_ptsG2j_cH8wQ8YV3PU4mVSARIrcHT5zOuPhdgBYDlv1sfafYwjP2StcSN6uCbhmyjSIrYGJ1-6mVvPw0MfLhUhEKD4Ehv_XmVQxp0GcrFzYWf_M7M-bp2zK0Vu7Lo0qL8e4LVDPqQuHYDV1gNq9OfSsnlcao_pkd1_Kb1bqhccYPSnX35fnazET1uYsarFfarp_eSMSO9QcrkkblmiRU0fPzyDg0ofGSUTcUs7dg19VcpvU',
  highProteinSteak: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJq9q0jdCTJUyxuPNjVpTFXyvoNwtFSXg06Fj7GEXKOzfCwyXXCenOo-Ezjg0Doo6jtnyf-UILCNNYNfNPKZp9D0c6SVlTdrl86wTRKC3HbqiXRs0bWGScFsxZO-h7Z9WsYAEILKZWpUh0DcJhCXlt0CCDy_r6QzQWzfrLZeYAX4qUArl_7XMoYG04iG05_fnYaAly3R9ngk95O2I6qeSkBTXD2Yra6GtUl46JsPrYkKu4civ0LQLOuGrvzIcXZ-w3eNKbaTV039s',
  vegetarianBowl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMKcRTMhlNJ6EHcKd5ou51RNU4Gf1Su6e-0fM4ZfC40DYuj7VZsdazv0tjIhGdv2_APz2AzNF7etWmYqEF6LTgYABKB10yaKI7Xb8llqoXumJOcHOTfFydF3gi2p5paizlN63SmMAUc9gDlm622SYBKtUhlqe9SBYmw6Y_Q-HfBD7EaqTm_nEbuh1RKUh5CkAWsTdzHtGH0gxgdKPs3-KkPKri3ehthb1CrOQUccYGycEWD7uJN3_pCeT43T17bk5Ilae4tbMITPo',
  diabeticSalad: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_0vp8algiSmr0NVXocXyVYBCvFte3ZNEWe4IzYEiiNbX3W5Cy-7VwM3ea0xpd2sqfWhc4plkXTFBDdPcfvCGJ7p1wwkMSJ5JS18gFYIxr6SAcJOVvuj-X3-U1jR4egRTparE8DPTPqW0dBW1ob_anGLplbcYvO9ePQ3FqHPIYExzpgR-2iB1CdTEe9BxPm6V7d7rIGhrxrxVvTakj179EmQ0pzXHNwlmUhXC34ovtMKoQe_FW3jqSV7jtf_aMQ9RXEJQNkVWV4vM',
  marcusBefore: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFfxCh0yPAMpE4HI_l-LId9x7wUZQyS4He6nhyQtOo6kNi23ljvaxRCH-xYAwfTj8qPvYy-DT9HZAzAx_I4q7RwDPXlMhVqALziD3coPGh-bEk2y0PKYGV_OpQfGbBuzQtGOgwP9nQJSm9nJFyqD4I_lGJNE6i2HN2rVUYUB4qUDxtif8dBLXHjJB0hhwXAzMrHoGGGzRh0pNLWem5Pyv_j6b5Zi_qrQo0Tv1-iEqG9ynDxLcKftxhLJP3pOvBgB42sAXPXPM615Y',
  marcusAfter: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArYRkkp2f95BIF8pTue-g0kRNkjAKOUXlzxclpbrx91d2Ik24ZyIzysL5OpzIDgWTPeCX6XCT-kUjFWMyc2sre1vtnaIVWMZjrqhB4XedrU7-r_DL7nFBQBzgR3ZfNa10j9vtf2wApuR5Pnn9mngKH40Ib0PxEANwRMNNTQLDQEQCzBokUvIWROEkTISAef5p-xt6i_jOEOLA8NO3rcAcZ1Up6g83otv5wNNBOlCiiI3OVUwyqAzVRpGIKUHBC3XD74oneztDzi8M',
  elenaBefore: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVVciePWyzBi1kqDhLM9kdb8k3CyqRmeTbWuvCPdaFpkLozDxjutmNZ6lAl-59ncyz1FWzrb5-ZRLKPgzSLN8Q_89Q_HFYi7TF8KyeIuNdKzDzzKbhHCmxNAigeDnPv9-Hj1PP0INfI6XHSdr_jRCjm41Y-_-uIZibJ___ZdYOx0GQ42ZXjp5tt7REfOmwR8L4HyHyrNh4SubCdNJj2OGBgblj7gBYhEL0aveOe-SFexaMhPa6vOAEp3yBtqsBQDemVoyN54GDMEY',
  elenaAfter: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3t8DdpiSjScKWPkI286eL6eoeOiGK0xCeHVRI5nDds-lY2CHXiuqOvlOLyu1NfE-c1uIr1Thu9fQ_p2QJLH0FF5Qs4TvqvHtNzElgcdAluOsKq8iLzFL2G7s33gCDqF3VhNf3vadaMBAYETWPpOSg08mjZBycbXYrfP56ilFpvTjamcEyCdyxU7sDZ0y7s2laWQ3E1Mb7ImetdgQRZ9IHMCQbNKvPT5Nw4oPdwYTrD-yLS2s4YtLeMZGFQlfZP7bQrDko_dntYdg',
  ctaTexture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxHO1-KKAjopmegdfHUQvd8_zPpGe9DfTuM5zqixZgXfZBXJsAOZ6SU-p-suTgsKEvg3XCVJ7ZKFXET4u3hIubrg2mqs-29II3vADXg1TDOEKrVLXiI142taqKGsn9vxpKMSndH1mrrR3k6S0ukCGz-g4FDLDX4uq_bMJ5cV9q1MnncYnSVDmvn6CZgby6khv18XQ8VVDCSwbEEDi2pPQpmhuYknt2_pzK-RbTAJ4K9qekVO7K9urIrPX-ROmdhk8WUYhlljy3xFU',
  athleticHero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWY_h8kD7im6fW5_qodcptX7tillmUgemlLzb02cH_Th4LqJfG7_-COTIXT74SdBXeGqmq7h9Klpp9QVumBU5QJnyxyoVZ2bL_q5JyzcLMD4nVh0Cql4FX7PfwcyJY0pcxhvIAFvr9VsKHSy8MbVc6SAJ-5tevN3cj7THQb0BVYl1xqmsaklIP4bNwIMWTc6n2Pm8EaALh-ZgH9mm-tGH1ZtmVbKkbMD5MiT_Qi1HiPR1aY5KPU-EAmQ8lwuQNiWyb_PF3MBmWTTk',
  sereneMorning: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkDW7emzlwvsVXXwOjGKa4ZtTcFeNxk-QxLcz7sG1DyV4pJn5guH5ek2yjvB9ZYJUCcfBeUXnjaebLonTX7zdS8F0AA5UohEVVFRLNf720GA-FArNy7qXll9JSDG4RUFZvHlO5BYFwpXzxR0dYqTc58Q6qUBYNjpXH5edqg4iR9j4JoYRd8DBpOpZdTUumrrA4n8xn9jryawXus1IY68-Qbtp2LJnGhI2yNzs1d4XA5-MEqc_2p7eL8dNA2v4YwoP8PmwymV7i4s8',
  coachAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHidUpOXZNoZWFYjyXRiNU1IiVWs4Pq38BT046GlooKbPfYvR_PqPyhf0p9AbnuSWmryoBwVS2I3Mwc_maQDc-P_Ye0VCuXcgG23cZdvzBo7HKMJ-Fz5_Et-Suu9mQjQOSbqDOZ5XaCx6pE2TdYo2628h_Yu5ABXlmhmlidQF5EBPpZbBT9MaSVglZ1vWOEF88Clh3KQj3q_A8vfDU313BQcU7TZOfkgQDi_Y1c2R3XNBYA7G0uqoBozTJY9yM-9HeP2_nmZ5PvDw',
  mealPrepJars: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEiMgiJlSBLXBYtQUCUYyxtXHaCLiRcRFmmqW78-8mecrxNaiY5Dn13-nXGq4iNsivmcrLbGC7baR_eS7uU7pmwcQblRIlHTWS5Ch742ETnS5Al7VuBrYQImQzpQXKwv7UBFuxsVnKndgMpl18ne21gfX7LThlzLaT0i9bEIONk0YVf5ahL3KFRb_4fftPN20n6JJzpeiN5RTsM8B1Qg2v5Rwc8YPJxAx_ej54mnBrxwdfIOqTfp7Yq3fUkKZTYg4V4QeFcAXfo9M',
  cookingClassWorkspace: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIfrzQtA9Olw-DI5_39BE3rlO161iw_5f4slNgLxQSvOo7sRGBRXDB1qhgmrGUldL3PthK8EFNuzzU_dsfjn8oD2zDNZpAdQvG_aT17VDBUxuC31zAK9u4EoRysYLRh8fYuXk6a6s30B1XykFjmG2hZ61ximO3N9lEwUpqtDNXMlFCxX_acoZu1coQaHnHa0caxsAUwReYwe57-pWyvnHv4W75pXg5ZLlO5EeuwE0h2JqSrrf7fElW37JFJmqjzbrOMAM7K70bpg'
};

export const COOKBOOKS_DATA: Cookbook[] = [
  {
    id: 'telugu-kitchen',
    title: 'The High-Protein Telugu Kitchen',
    category: 'high-protein',
    price: 999,
    oldPrice: 1499,
    description: 'Master the art of traditional South Indian cuisine optimized for modern muscle building and fat loss. 60+ custom macro-calculated masterpieces.',
    image: ASSET_IMAGES.teluguKitchen,
    tag: 'Best Seller',
    features: ['60+ High Protein South Indian Meals', 'Full Macro & Micro breakdowns', 'MyFitnessPal Integration Links', 'Smart Substitutes for Dairy & Carb-light options'],
    macros: 'Avg 42g Protein / meal'
  },
  {
    id: 'air-fryer',
    title: 'Modern Air Fryer Recipes',
    category: 'air-fryer',
    price: 799,
    oldPrice: 1199,
    description: 'Perfectly crispy roasted vegetables and ultra-lean flavorful proteins. High detail cinematic steam and precision clean eating strategies.',
    image: ASSET_IMAGES.airFryerRecipes,
    features: ['35+ Quick Air Fryer blueprints', 'Zero added oils / High Saturation techniques', 'Meal prep friendly storage steps']
  },
  {
    id: 'meal-prep',
    title: 'Fat Loss Meal Prep Guide',
    category: 'high-protein',
    price: 899,
    oldPrice: 1299,
    description: 'The ultimate system for professional-grade batch prepped meals without the culinary burnout. Includes full 7-day layout schedules and smart checklists.',
    image: ASSET_IMAGES.mealPrepGuide,
    tag: 'Highly Rated',
    features: ['7-Day fully optimized plan', 'Comprehensive grocery list matrices', 'Leakproof container sizing hacks']
  },
  {
    id: 'complete-bundle',
    title: 'The Complete Cookbook Bundle',
    category: 'bundle',
    price: 2499,
    oldPrice: 3697,
    description: 'Every cookbook in one bundle: Telugu Kitchen, Air Fryer Recipes, and the Meal Prep Guide. The full library at one price.',
    image: ASSET_IMAGES.cookbookHeroBg,
    tag: 'Best Value',
    features: ['All 3 cookbooks included', '100+ High Protein recipes', 'Save vs buying separately']
  }
];

export const EVENTS_DATA: EventSession[] = [
  {
    id: 'event-1',
    title: 'Weekly Meal Prep Web Call',
    date: '12',
    month: 'OCT',
    description: 'Master the art of high-protein, low-friction batch cooking for the modern professional. Virtual cooking layout check.',
    time: '10:00 AM EST',
    joined: 42,
    tag: 'Upcoming Live',
    tagColor: 'bg-brand-beige text-black',
    image: ASSET_IMAGES.mealPrepJars
  },
  {
    id: 'event-2',
    title: 'Interactive Cooking Class',
    date: '15',
    month: 'OCT',
    description: 'Deep dive into gourmet technique with metabolic focus. This week: Professional clean sous-vide mastery.',
    time: '06:30 PM EST',
    joined: 28,
    tag: 'Members Only',
    tagColor: 'bg-brand-olive text-white',
    image: ASSET_IMAGES.cookingClassWorkspace,
    level: 'Intermediate'
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'test-1',
    name: 'James Dalton',
    role: 'Marathon Athlete',
    initials: 'JD',
    quote: "The distinction between 'eating healthy' and 'scientific nutrition' is what Saketh masters. It's a pure luxury experience for your body."
  },
  {
    id: 'test-2',
    name: 'Sarah Al-Fayed',
    role: 'Culinary Critic',
    initials: 'SA',
    quote: "Diabetic-Friendly plans that actually taste like Michelin-star meals. I don't feel like a health patient anymore, I feel like an absolute foodie."
  },
  {
    id: 'test-3',
    name: 'Thomas Miller',
    role: 'Founder, Nexus Tech',
    initials: 'TM',
    quote: "The accountability in the community is worth the price alone. You're not just buying a recipe book, you're buying a structured aesthetic lifestyle."
  }
];

export const DIET_PLANS: DietPlan[] = [
  {
    id: 'fat-loss-veg',
    title: 'Fat Loss (Veg)',
    price: 1499,
    period: 'plan',
    description: 'Vegetarian fat-loss protocol with paneer, soya, and dal-first macro structures.',
    image: ASSET_IMAGES.beginnerFatLoss,
    badge: 'Veg',
    goal: 'fat-loss',
    dietType: 'veg'
  },
  {
    id: 'fat-loss-non-veg',
    title: 'Fat Loss (Non-Veg)',
    price: 1499,
    period: 'plan',
    description: 'Lean chicken, fish, and egg-based cutting plan with Indian kitchen staples.',
    image: ASSET_IMAGES.highProteinSteak,
    goal: 'fat-loss',
    dietType: 'non-veg'
  },
  {
    id: 'fat-loss-vegan',
    title: 'Fat Loss (Vegan)',
    price: 1499,
    period: 'plan',
    description: 'Fully plant-based deficit plan built on tofu, tempeh, and legumes.',
    image: ASSET_IMAGES.veganBlueprint,
    badge: 'Vegan',
    goal: 'fat-loss',
    dietType: 'vegan'
  },
  {
    id: 'muscle-gain-veg',
    title: 'Muscle Gain (Veg)',
    price: 1499,
    period: 'plan',
    description: 'Vegetarian hypertrophy nutrition with surplus calories and 2g/kg protein targets.',
    image: ASSET_IMAGES.vegetarianBowl,
    goal: 'muscle-gain',
    dietType: 'veg'
  },
  {
    id: 'muscle-gain-non-veg',
    title: 'Muscle Gain (Non-Veg)',
    price: 1499,
    period: 'plan',
    description: 'High-protein mass-building plan with chicken, eggs, and fish rotations.',
    image: ASSET_IMAGES.highProteinSteak,
    badge: 'Most Popular',
    popular: true,
    goal: 'muscle-gain',
    dietType: 'non-veg'
  },
  {
    id: 'lean-bulk',
    title: 'Lean Bulk',
    price: 1499,
    period: 'plan',
    description: 'Controlled surplus for clean size gains with minimal fat spillover.',
    image: ASSET_IMAGES.lean30,
    goal: 'lean-bulk',
    dietType: 'any'
  },
  {
    id: 'cutting',
    title: 'Cutting',
    price: 1499,
    period: 'plan',
    description: 'Aggressive-but-safe shredding protocol for visible definition phases.',
    image: ASSET_IMAGES.beginnerFatLoss,
    goal: 'cutting',
    dietType: 'any'
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    price: 1499,
    period: 'plan',
    description: 'Stay exactly where you are: balanced Indian maintenance eating for life.',
    image: ASSET_IMAGES.vegetarianBowl,
    goal: 'maintenance',
    dietType: 'any'
  },
  {
    id: 'pcos-friendly',
    title: 'PCOS-Friendly',
    price: 1499,
    period: 'plan',
    description: 'Low-glycemic, seed-cycling aware plan supporting hormonal balance.',
    image: ASSET_IMAGES.diabeticSalad,
    badge: 'Hormone Health',
    goal: 'pcos',
    dietType: 'veg'
  },
  {
    id: 'diabetes-friendly',
    title: 'Diabetes-Friendly',
    price: 1499,
    period: 'plan',
    description: 'Glycemic-conscious protocols for insulin optimization and metabolic longevity.',
    image: ASSET_IMAGES.diabeticSalad,
    badge: 'Wellness Focus',
    goal: 'diabetes',
    dietType: 'any'
  },
  {
    id: 'student-budget',
    title: 'Student Budget',
    price: 999,
    period: 'plan',
    description: 'Maximum protein per rupee: hostel and budget-kitchen friendly fat loss.',
    image: ASSET_IMAGES.mealPrepJars,
    badge: 'Budget',
    goal: 'fat-loss',
    dietType: 'veg'
  },
  {
    id: 'office-worker',
    title: 'Office Worker',
    price: 1499,
    period: 'plan',
    description: 'Desk-job friendly plan with tiffin, cafeteria, and late-night-shift strategies.',
    image: ASSET_IMAGES.cookingClassWorkspace,
    goal: 'maintenance',
    dietType: 'any'
  },
  {
    id: 'high-protein-indian',
    title: 'High Protein Indian Diet',
    price: 1499,
    period: 'plan',
    description: 'The flagship: everyday Indian meals re-engineered for 120g+ protein days.',
    image: ASSET_IMAGES.teluguKitchen,
    badge: 'Flagship',
    goal: 'muscle-gain',
    dietType: 'any'
  },
  {
    id: 'custom-diet-plan',
    title: 'Custom Diet Plan',
    price: 3999,
    period: 'plan',
    description: 'Fully personalized plan built 1:1 around your labs, schedule, and food preferences.',
    image: ASSET_IMAGES.dietPlansHeroBg,
    badge: 'Custom',
    goal: 'custom',
    dietType: 'any'
  }
];

export const COACHING_PLANS: CoachingPlan[] = [
  {
    id: 'coaching-1-month',
    title: '1-Month 1:1 Coaching',
    price: 7500,
    duration: '1 month',
    durationMonths: 1,
    description: 'Four weeks of strategic nutrition coaching with weekly check-ins and WhatsApp support.',
    image: ASSET_IMAGES.coachAvatar,
    features: ['Weekly check-ins', 'WhatsApp support', 'Nutrition guidance', 'Progress tracking']
  },
  {
    id: 'coaching-3-month',
    title: '3-Month 1:1 Coaching',
    price: 15000,
    duration: '3 months',
    durationMonths: 3,
    description: 'A full quarter of coaching for real body-composition transformation.',
    image: ASSET_IMAGES.athleticHero,
    badge: 'Most Popular',
    popular: true,
    features: ['Weekly check-ins', 'WhatsApp support', 'Nutrition guidance', 'Progress tracking']
  },
  {
    id: 'coaching-6-month',
    title: '6-Month 1:1 Coaching',
    price: 50000,
    duration: '6 months',
    durationMonths: 6,
    description: 'Half a year of elite accountability for a complete lifestyle overhaul.',
    image: ASSET_IMAGES.sereneMorning,
    badge: 'Best Value',
    features: ['Weekly check-ins', 'WhatsApp support', 'Nutrition guidance', 'Progress tracking']
  }
];

export const CONSULTATIONS: Consultation[] = [
  {
    id: 'nutrition-consult',
    title: 'Nutrition Consultation',
    price: 999,
    duration: '45 min',
    description: 'A focused 1:1 session to audit your current eating and fix the biggest leaks.',
    image: ASSET_IMAGES.diabeticSalad
  },
  {
    id: 'healthy-cooking-consult',
    title: 'Healthy Cooking Session',
    price: 1499,
    duration: '60 min',
    description: 'Live cooking guidance to make your own kitchen produce restaurant-grade healthy food.',
    image: ASSET_IMAGES.cookingClassWorkspace
  },
  {
    id: 'meal-prep-consult',
    title: 'Meal Prep Consultation',
    price: 999,
    duration: '45 min',
    description: 'Design your weekly batch-cooking system with containers, schedules, and macros.',
    image: ASSET_IMAGES.mealPrepJars
  },
  {
    id: 'grocery-shopping-consult',
    title: 'Grocery Shopping Guide',
    price: 799,
    duration: '30 min',
    description: 'Learn to read labels and build a high-protein Indian grocery list on any budget.',
    image: ASSET_IMAGES.vegetarianBowl
  }
];

export const COURSES: Course[] = [
  {
    id: 'meal-prep-course',
    title: 'Meal Prep Video Course',
    price: 1999,
    description: 'Self-paced video course: batch cooking systems, storage science, and weekly layouts.',
    image: ASSET_IMAGES.mealPrepJars,
    tag: 'Video Course',
    features: ['Step-by-step video lessons', 'Downloadable checklists', 'Lifetime access']
  }
];

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-access',
    question: 'How do I read my cookbook after buying it?',
    answer: 'Open My Library after signing in and tap Read Book. Cookbooks open in a protected online reader tied to your account.'
  },
  {
    id: 'faq-personalized',
    question: 'Are the diet plans personalized?',
    answer: 'The goal-specific plans are structured protocols. For a fully personalized build around your schedule and preferences, choose the Custom Diet Plan or 1:1 coaching.'
  },
  {
    id: 'faq-coaching',
    question: 'What does 1:1 coaching include?',
    answer: 'Weekly check-ins, WhatsApp support, nutrition guidance, and progress tracking for the full duration of your plan.'
  },
  {
    id: 'faq-veg',
    question: 'Do you support vegetarian and vegan diets?',
    answer: 'Yes. Dedicated Veg, Non-Veg, and Vegan variants exist for fat loss and muscle gain, plus a standalone vegetarian range.'
  },
  {
    id: 'faq-consult',
    question: 'How do consultations work?',
    answer: 'Pick a consultation type, choose a date and time, and you will receive session details on your registered email after booking.'
  },
  {
    id: 'faq-support',
    question: 'I paid but my library is empty. What do I do?',
    answer: 'Do not pay again. Sign in with the same Google account you used at checkout and refresh My Library. If it is still empty, contact support with your order ID.'
  }
];
