import express from "express";
import { Index } from "flexsearch";
const router = express.Router();

const siteContent = [
  {
    id: 1,
    title: "Nos produits, une gamme complète et disponible ",
    url: "../produits.html",
    sections: [
    {
      heading: "Fils et câbles domestiques et industriels",
      text: "GSD vous propose une gamme complète de fils et câbles normalisés basse-tension, courants forts et courant faibles en conditionnements standards ou à la coupe. H07V-U/R, U 1000 R2V, FR-NO7V-AR, CR1-C1, Courants faibles"
    },
    {
      heading: "Gaines préfilées prêtes à poser",
      text: "GSD vous propose une fabrication sur mesure de toutes les compositions courants forts et courants faibles dans les conduits ICTA 3422 diam.16 à 40 ICTA 16 c.100m 35 Rouleaux par palettes ICTA 20 c.100m 28 Rouleaux par palettes, ICTA 25 c.100m 20 Rouleaux par palettes, ICTA 32/40 c.100m 20 Rouleaux par palettes"
    },
    {
      heading: "Gaines et accessoires",
      text: "GSD vous propose sa gamme complète de conduits ICTA 3422 annelée, cintrable, avec ou sans tire-fil en acier galvanisé. Conditionnement en couronnes standards ou grandes longueurs. Gaine ICTA 3422 annelée. Diamètres extérieurs 16, 20, 25, 32, 40"
    },
    {
      heading: "Mise à la terre",
      text: "GSD vous propose une large gamme de matériel de mise à la terre, pour des installations électriques fiables, sûres et de qualité. Câblette de cuivre nu rouge recuit en tourets ou à la coupe. Piquets de terre acier cuivré diam. 14 auto-allongeable 1.00m et 1.50m, Brides de connexion laiton pour piquets, Barrettes de coupure hautes et basses, Connecteurs en « C », têtes d’enfoncement… "
    }
   ]
  },
  {
    id: 2,
    title: "A propos de nous",
    url: "../about-us.html",
    sections: [
      {
        heading: "Notre histoire",
        text: "Depuis plus de 35 ans, GSD distribue tous types de matériel électrique, en France comme à l’international, en palettes panachées ou en camions/conteneurs complets. Fondée en 1990 sur les bases d’une société de négoce, l’entreprise a évolué pour se spécialiser dans la vente et la production sur mesure de matériel électrique. Agent dépositaire de câbleries, GS EURODIFFUSION propose une gamme complète, compétitive et adaptée, permettant d’assurer vos approvisionnements complets ou répondre à vos besoins en dépannage sur son stock câbles, préfilés, conduits et mise à la terre."
      }
    ]
  },
  {
    id: 3,
    title: "Nos services", 
    url: "../nos-services.html",
    sections:[
      {
        heading: "Agent commercial",
        text: "GSD est votre partenaire privilégié pour l’approvisionnement complet en fils cuivre et aluminium. Agent commercial de fabricants leaders dans leurs pays, nous vous permettons d’acheter directement auprès des câbleries, sans intermédiaires.Bénéficiez de tarifs compétitifs, d’un service réactif et de l’accès à une offre complète et maîtrisée indexée sur le cours des matières premières."
      },
      {
        heading: "Rachat et recyclage de cuivre",
        text: "Dans une démarche responsable et engagée, GSD propose le rachat de vos chutes de cuivre afin de leur offrir une seconde vie grâce au recyclage. Nous nous engageons à reprendre vos chutes au meilleur prix, indexé sur le cours LME du cuivre, tout en contribuant ensemble à une économie plus durable et circulaire."
      }
    ]
  },
  {
    id: 4,
    title: "Cours de cuivre",
    url: "../cours-de-cuivre.html",
    sections:[
      {
        heading: "Taux d'une tonne de cuivre",
        text: "Calendrier des variations du taux de change de cuivre"
      }
    ]
  }
];

const index = new Index({
  charset: "latin:extra",
  tokenize: "forward",
  optimize: true,
  resolution: 5,
});

const pageMap = new Map();

siteContent.forEach((page, i) => {
  const fullText = `${page.title} ${page.sections.map(section => `${section.heading} ${section.text}`).join(" ")}`;
  index.add(page.id, fullText);
  pageMap.set(page.id, page);
});


router.get("/api/search", async (req, res) => {
  const query = req.query.query?.trim();

  if(!query || query.length < 2) {
    return res.status(400).json({ error: "Invalid search query"});
  }

  try {
    const searchResult = await index.search(query, { limit: 5 });

    let ids = [];

    if (Array.isArray(searchResult)) {
      searchResult.forEach(fieldResult => {
        if(fieldResult && fieldResult.result) {
          ids.push(...fieldResult.result);
        }
      })
    }
    
    const results = searchResult.map(id => {
      const page = pageMap.get(id);
      if(!page)
        return null;
      const preview = page.sections[0]?.text.slice(0,100) + "...";
      return {
        title: page.title,
        url: page.url,
        preview: preview
      }
    }).filter(Boolean);
    res.json({ results });
  } catch (err){
    console.error(err);
    res.status(500).json({ error: "Search error"});
  }
})

export default router;