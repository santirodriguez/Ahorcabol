"use strict";

(() => {
  const teamData = [
    {
      pais: "Argentina",
      equipos: [
        "Aldosivi",
        "Argentinos Juniors",
        "Atlético Tucumán",
        "Banfield",
        "Barracas Central",
        "Belgrano",
        "Boca Juniors",
        "Central Córdoba",
        "Defensa y Justicia",
        "Deportivo Riestra",
        "Estudiantes de La Plata",
        "Estudiantes de Río Cuarto",
        "Gimnasia y Esgrima de Mendoza",
        "Gimnasia y Esgrima La Plata",
        "Huracán",
        "Independiente",
        "Independiente Rivadavia",
        "Instituto de Córdoba",
        "Lanús",
        "Newell's Old Boys",
        "Platense",
        "Racing",
        "River Plate",
        "Rosario Central",
        "San Lorenzo",
        "Sarmiento",
        "Talleres de Córdoba",
        "Tigre",
        "Unión de Santa Fe",
        "Vélez Sarsfield"
      ]
    },
    {
      pais: "España",
      equipos: [
        "Alavés",
        "Athletic Club",
        "Atlético de Madrid",
        "Barcelona",
        "Celta de Vigo",
        "Deportivo La Coruña",
        "Elche",
        "Espanyol",
        "Getafe",
        "Levante",
        "Málaga",
        "Osasuna",
        "Racing de Santander",
        "Rayo Vallecano",
        "Real Betis",
        "Real Madrid",
        "Real Sociedad",
        "Sevilla",
        "Valencia",
        "Villarreal"
      ]
    },
    {
      pais: "Inglaterra",
      equipos: [
        "Arsenal",
        "Aston Villa",
        "Bournemouth",
        "Brentford",
        "Brighton & Hove Albion",
        "Chelsea",
        "Coventry City",
        "Crystal Palace",
        "Everton",
        "Fulham",
        "Hull City",
        "Ipswich Town",
        "Leeds United",
        "Liverpool",
        "Manchester City",
        "Manchester United",
        "Newcastle United",
        "Nottingham Forest",
        "Sunderland",
        "Tottenham Hotspur"
      ]
    },
    {
      pais: "MLS",
      equipos: [
        "Atlanta United",
        "Austin FC",
        "Charlotte FC",
        "Chicago Fire FC",
        "FC Cincinnati",
        "Colorado Rapids",
        "Columbus Crew",
        "D.C. United",
        "FC Dallas",
        "Houston Dynamo FC",
        "Inter Miami CF",
        "LA Galaxy",
        "Los Angeles Football Club",
        "Minnesota United FC",
        "CF Montréal",
        "Nashville SC",
        "New England Revolution",
        "New York City FC",
        "Orlando City SC",
        "Philadelphia Union",
        "Portland Timbers",
        "Real Salt Lake",
        "Red Bull New York",
        "San Diego FC",
        "San Jose Earthquakes",
        "Seattle Sounders FC",
        "Sporting Kansas City",
        "St. Louis CITY SC",
        "Toronto FC",
        "Vancouver Whitecaps FC"
      ]
    },
    {
      pais: "Alemania",
      equipos: [
        "Augsburg",
        "Bayer Leverkusen",
        "Bayern München",
        "Borussia Dortmund",
        "Borussia Mönchengladbach",
        "Eintracht Frankfurt",
        "Elversberg",
        "Freiburg",
        "Hamburg",
        "Hoffenheim",
        "Köln",
        "Mainz",
        "Paderborn",
        "RB Leipzig",
        "Schalke 04",
        "Stuttgart",
        "Union Berlin",
        "Werder Bremen"
      ]
    },
    {
      pais: "Francia",
      equipos: [
        "Angers",
        "Auxerre",
        "Brest",
        "Le Havre",
        "Le Mans",
        "Lens",
        "Lille",
        "Lorient",
        "Lyon",
        "Marseille",
        "Monaco",
        "Nice",
        "Paris FC",
        "Paris Saint-Germain",
        "Rennes",
        "Strasbourg",
        "Toulouse",
        "Troyes"
      ]
    },
    {
      pais: "Portugal",
      equipos: [
        "Académico de Viseu",
        "Alverca",
        "Arouca",
        "Benfica",
        "Braga",
        "Casa Pia",
        "Estoril",
        "Estrela da Amadora",
        "Famalicão",
        "Gil Vicente",
        "Marítimo",
        "Moreirense",
        "Nacional",
        "Porto",
        "Rio Ave",
        "Santa Clara",
        "Sporting CP",
        "Vitória de Guimarães"
      ]
    },
    {
      pais: "Brasil",
      equipos: [
        "Athletico Paranaense",
        "Atlético Mineiro",
        "Bahia",
        "Botafogo",
        "Chapecoense",
        "Corinthians",
        "Coritiba",
        "Cruzeiro",
        "Flamengo",
        "Fluminense",
        "Grêmio",
        "Internacional",
        "Mirassol",
        "Palmeiras",
        "Red Bull Bragantino",
        "Remo",
        "Santos",
        "São Paulo",
        "Vasco da Gama",
        "Vitória"
      ]
    }
  ];

  window.AHORCABOL_TEAM_DATA = teamData;

  // Keep the existing loader API working under both http(s):// and file://.
  // Browsers commonly block fetch() for sibling files opened from disk.
  const nativeFetch = typeof window.fetch === "function" ? window.fetch.bind(window) : null;

  window.fetch = function ahorcabolFetch(input, init) {
    const url = typeof input === "string" ? input : input?.url || "";

    if (url === "teamlist.json" || url.endsWith("/teamlist.json")) {
      return Promise.resolve(
        new Response(JSON.stringify(teamData), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json; charset=utf-8" }
        })
      );
    }

    if (!nativeFetch) {
      return Promise.reject(new TypeError("Fetch API is unavailable."));
    }

    return nativeFetch(input, init);
  };
})();
