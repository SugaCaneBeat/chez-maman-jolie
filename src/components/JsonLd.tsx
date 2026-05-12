/**
 * Données structurées Schema.org pour Chez Maman Jolie.
 * Injecte 5 blocs JSON-LD :
 *  1. Restaurant (fiche enrichie Google Search / Maps)
 *  2. Menu (résultats enrichis Menu)
 *  3. FAQPage (accordéon dans les résultats)
 *  4. Organization
 *  5. WebSite (sitelinks searchbox)
 *
 * À placer dans la page d'accueil. Les blocs sont sérialisés une seule fois
 * côté serveur — pas de coût client.
 */

const SITE_URL = "https://www.chezmamanjolie.com";
const PHONE = "+33753873213";
const SOCIAL = ["https://www.instagram.com/chezmamanjolie/"];

type MenuItem = {
  name: string;
  description?: string;
  price?: string;
};

type MenuSection = {
  name: string;
  items: MenuItem[];
};

const MENU: MenuSection[] = [
  {
    name: "Entrées",
    items: [
      {
        name: "4 Samoussas bœuf",
        description:
          "Samoussas croustillants garnis de bœuf épicé, préparation maison.",
        price: "5.90",
      },
      {
        name: "Mikaté",
        description:
          "Beignets africains moelleux et légèrement sucrés, traditionnellement servis en entrée ou en accompagnement.",
        price: "5.90",
      },
    ],
  },
  {
    name: "Spécialités Maison",
    items: [
      {
        name: "Madesu (haricots)",
        description:
          "Haricots rouges mijotés à la mode congolaise, servis avec du riz.",
        price: "8.00",
      },
      {
        name: "5 Ailes de poulet",
        description:
          "Ailes de poulet marinées et grillées, servies avec banane plantain.",
        price: "9.00",
      },
      {
        name: "Yassa Poulet",
        description:
          "Plat sénégalais emblématique : poulet mariné au citron et aux oignons confits, servi avec du riz.",
        price: "9.00",
      },
    ],
  },
  {
    name: "Viandes",
    items: [
      {
        name: "5 Brochettes",
        description: "Brochettes de bœuf marinées et grillées au feu de bois.",
        price: "12.00",
      },
      {
        name: "Makosso (bouillon)",
        description:
          "Bouillon traditionnel congolais, riche en saveurs et en épices.",
        price: "12.00",
      },
      {
        name: "Cuisses de poulet",
        description:
          "Cuisses de poulet rôties à la mode africaine, juteuses et savoureuses.",
        price: "12.00",
      },
      {
        name: "Ntaba — chèvre",
        description:
          "Chèvre mijotée à la congolaise, viande tendre et parfumée.",
        price: "15.00",
      },
      {
        name: "Ngulu bouillon",
        description:
          "Bouillon de porc traditionnel, plat généreux et réconfortant.",
        price: "15.00",
      },
    ],
  },
  {
    name: "Poissons",
    items: [
      {
        name: "Malangwa",
        description:
          "Poisson traditionnel africain, préparé selon la recette ancestrale.",
        price: "15.00",
      },
      {
        name: "Makayabu",
        description:
          "Morue salée et séchée, spécialité congolaise très appréciée.",
        price: "15.00",
      },
      {
        name: "Dorade entière",
        description: "Dorade fraîche grillée, assaisonnée aux épices africaines.",
        price: "16.00",
      },
    ],
  },
  {
    name: "Cuisine Mijotée",
    items: [
      {
        name: "Poulet Mafé",
        description:
          "Plat sénégalais emblématique : poulet mijoté dans une sauce onctueuse à la pâte d'arachide.",
        price: "12.00",
      },
      {
        name: "Yassa",
        description:
          "Spécialité sénégalaise à base d'oignons confits et de citron, servie avec du riz.",
        price: "12.00",
      },
    ],
  },
  {
    name: "Légumes",
    items: [
      {
        name: "Pondu",
        description:
          "Feuilles de manioc pilées, plat national de la République Démocratique du Congo, mijotées avec huile de palme et épices.",
        price: "7.00",
      },
      {
        name: "Fumbwa",
        description:
          "Feuilles sauvages congolaises mijotées, plat raffiné et parfumé.",
        price: "7.00",
      },
      {
        name: "Légumes verts",
        description: "Légumes verts sautés à l'africaine.",
        price: "7.00",
      },
    ],
  },
  {
    name: "Accompagnements",
    items: [
      {
        name: "Makemba (bananes plantains)",
        description:
          "Bananes plantains frites ou bouillies, accompagnement traditionnel.",
        price: "3.00",
      },
      {
        name: "Chikwangue",
        description:
          "Pain de manioc fermenté, accompagnement emblématique de la cuisine congolaise.",
        price: "3.00",
      },
      { name: "Riz", description: "Riz blanc parfumé.", price: "3.00" },
    ],
  },
  {
    name: "Desserts",
    items: [
      {
        name: "Tiramisu Mangue & Spéculos",
        description: "Tiramisu maison revisité à la mangue et au spéculoos.",
        price: "3.30",
      },
    ],
  },
  {
    name: "Boissons",
    items: [
      {
        name: "Bissap",
        description:
          "Boisson rafraîchissante à base de fleurs d'hibiscus, spécialité d'Afrique de l'Ouest.",
        price: "3.00",
      },
      {
        name: "Gingembre",
        description:
          "Boisson épicée au gingembre frais, recette traditionnelle.",
        price: "3.00",
      },
      { name: "Coca-Cola / Fanta / Sprite", price: "2.00" },
      { name: "Eau minérale", price: "1.50" },
    ],
  },
];

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: "Quelle cuisine propose Chez Maman Jolie ?",
    answer:
      "Chez Maman Jolie propose une cuisine africaine authentique avec des spécialités du Congo (pondu, fumbwa, madesu, makayabu), du Sénégal (yassa, mafé, thiéboudiène) et d'Afrique de l'Ouest. Tous les plats sont préparés maison avec des ingrédients frais.",
  },
  {
    question: "Où livrez-vous ?",
    answer:
      "Nous livrons à Paris et en petite couronne depuis Paris 11ème. Zone 1 (moins de 3 km) : livraison gratuite. Zone 2 (3 à 6 km) : 2,50€. Zone 3 (6 à 10 km) : 4,50€ dès 30€ de commande, sinon 6€. Commande minimum : 25€.",
  },
  {
    question: "Comment commander ?",
    answer:
      "Commandez directement par WhatsApp au 07 53 87 32 13 ou via le site. Paiement sécurisé par carte bancaire. Livraison en 30 à 50 minutes selon la zone.",
  },
  {
    question: "Proposez-vous un service traiteur pour les événements ?",
    answer:
      "Oui, Chez Maman Jolie propose un service traiteur événementiel pour mariages, anniversaires, baptêmes, repas d'entreprise et toute occasion spéciale. Contactez-nous par WhatsApp pour un devis personnalisé.",
  },
  {
    question: "Quels sont vos horaires ?",
    answer:
      "Livraison du lundi au samedi, de 11h à 21h30. Fermé le dimanche.",
  },
  {
    question: "Qu'est-ce que le pondu ?",
    answer:
      "Le pondu est le plat national de la République Démocratique du Congo. Il s'agit de feuilles de manioc pilées et mijotées longuement avec de l'huile de palme, de l'oignon, de l'ail et des épices. C'est l'un de nos plats signatures.",
  },
  {
    question: "Qu'est-ce que le yassa ?",
    answer:
      "Le yassa est une spécialité sénégalaise emblématique : du poulet (ou du poisson) mariné dans du jus de citron et mijoté avec des oignons confits. Plat à la fois acidulé et fondant, servi avec du riz blanc.",
  },
];

function buildSchema() {
  const restaurant = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: "Chez Maman Jolie",
    alternateName: "Maman Jolie - Cuisine Africaine",
    description:
      "Restaurant et traiteur spécialisé en cuisine africaine authentique du Congo, du Sénégal et d'Afrique de l'Ouest. Livraison à Paris et petite couronne, traiteur événementiel.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    image: [`${SITE_URL}/og-image.jpg`],
    telephone: PHONE,
    priceRange: "€€",
    servesCuisine: [
      "Cuisine africaine",
      "Cuisine congolaise",
      "Cuisine sénégalaise",
      "Cuisine ouest-africaine",
    ],
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Paris",
      addressRegion: "Île-de-France",
      postalCode: "75011",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 48.8634,
      longitude: 2.3789,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "11:00",
        closes: "21:30",
      },
    ],
    sameAs: SOCIAL,
    hasMenu: { "@id": `${SITE_URL}/#menu` },
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://wa.me/33753873213",
        inLanguage: "fr-FR",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      deliveryMethod: ["http://schema.org/ParcelService"],
    },
    areaServed: [
      { "@type": "City", name: "Paris" },
      { "@type": "AdministrativeArea", name: "Hauts-de-Seine" },
      { "@type": "AdministrativeArea", name: "Seine-Saint-Denis" },
      { "@type": "AdministrativeArea", name: "Val-de-Marne" },
    ],
  };

  const menu = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${SITE_URL}/#menu`,
    name: "Carte Chez Maman Jolie",
    inLanguage: "fr",
    hasMenuSection: MENU.map((section) => ({
      "@type": "MenuSection",
      name: section.name,
      hasMenuItem: section.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
        ...(item.price
          ? {
              offers: {
                "@type": "Offer",
                price: item.price,
                priceCurrency: "EUR",
              },
            }
          : {}),
      })),
    })),
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Chez Maman Jolie",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: SOCIAL,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: PHONE,
      contactType: "customer service",
      areaServed: "FR",
      availableLanguage: ["French"],
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Chez Maman Jolie",
    url: SITE_URL,
    inLanguage: "fr-FR",
  };

  return [restaurant, menu, faq, organization, website];
}

export default function JsonLd() {
  const schemas = buildSchema();
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
