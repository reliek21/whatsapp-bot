import { MemoryDB as Database } from "@builderbot/bot";
import FlowClass from "@builderbot/bot/dist/io/flowClass";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} from "@builderbot/bot";
import { TFlow } from "@builderbot/bot/dist/types";

import { getGreetingFlow } from "./helpers/current-hour.helper";
import { greetingStandard } from "./messages/greetings.message";
import { botMessage, standardMessages } from "./messages/sofia.message";

// Test identify
import {
  GenerateContentResult,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
const generativeAI = new GoogleGenerativeAI(
  "AIzaSyB_nsRFHaP_scaFzxrdwGXEQNIpB_rjUSY",
);

const model: GenerativeModel = generativeAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
const namePrompt: string =
  "Your task is to determine if the user provided a name. Respond with the name if a name is present, and 'false' if no name is provided. Return only the name or 'false' without additional text or explanation. Input of the user: ";
const cityPrompt: string =
  "Your task is to identify if the user mentioned a city in their input. Respond with the name of the city if mentioned, or 'none' if no city is provided. Focus specifically on cities in Colombia. Return only the city name or 'none' without additional text or explanation. Input of the user: ";

// dynamic greeting flow
const dynamicGreetingFlow: TFlow<Provider, Database> = addKeyword<
  Provider,
  Database
>(greetingStandard)
  .addAction(async (_, { flowDynamic }) => {
    const greetingFlow: string = getGreetingFlow();

    if (greetingFlow === "morningFlow") {
      return flowDynamic("Hola, Buenos días 🌞");
    } else if (greetingFlow === "afternoonFlow") {
      return flowDynamic("Hola, Buenas tardes 🌞");
    } else if (greetingFlow === "nightFlow") {
      return flowDynamic("Hola, Buenas noches 🌜");
    } else {
      return flowDynamic(botMessage);
    }
  })
  .addAnswer(standardMessages, { delay: 2000, capture: true })
  .addAction(async (ctx, { flowDynamic, state }) => {
    try {
      const name: string = ctx.body.toLowerCase().trim();

      const result: GenerateContentResult = await model.generateContent(
        namePrompt + name,
      );
      const response: string = result.response.text();

      if (response.trim() === "false") {
        return await flowDynamic(
          "Super, continuamos, ¿me ayudas con la siguiente pregunta? 😊",
          { delay: 3000 },
        );
      }

      await state.update({ response });
      return await flowDynamic(
        `Hola, ${response.trim()}, Bienvenid@ a Divino Placer 😊, nos encontramos ubicados en Bogotá.`,
        { delay: 5000 },
      );
    } catch (error) {
      console.error("Error in greeting flow:", error);
      return flowDynamic("¡Algo salió mal! Por favor, inténtalo de nuevo.");
    }
  })
  .addAnswer("¿Desde que ciudad nos hablas?", { delay: 2000, capture: true })
  .addAction(async (ctx, { flowDynamic, state }) => {
    const city: string = ctx.body.toLowerCase();

    const result: GenerateContentResult = await model.generateContent(
      cityPrompt + city,
    );
    const response: string = result.response.text();
    const isCity: string = response;

    if (!city || city.trim().length === 0 || isCity === "none" || !isCity) {
      return await flowDynamic("Ok, continuamos. 😊", { delay: 3000 });
    }

    await state.update({ city });

    const detectBogota: string = city.includes("bogota") ? "bogota" : "";
    if (detectBogota || isCity.includes("bogota")) {
      return await flowDynamic(
        "Ayúdanos con tu dirección para cotizar el envío 🚚",
        { delay: 5000 },
      );
    } else if (isCity === "none") {
      return await flowDynamic(
        `No logre leer la ciudad, Ingresa de nuevo la ciudad o pues, lo hacemos más adelante. 😊`,
        { delay: 5000 },
      );
    } else {
      return await flowDynamic(
        `Los pedidos a ${isCity} llegan en 24 a 48 horas hábiles.`,
        { delay: 5000 },
      );
    }
  })
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic(
      "¿Estas en busca de una categoria en especifico producto en especifico?",
      { delay: 3000 },
    );
  });
//.addAnswer("¿Estas en busca de una categoria en especifico producto en especifico?", { delay: 3000 });

const cityFlow = addKeyword<Provider, Database>([
  "donde estan ubicados",
  "dónde están ubicados",
  "ubicacion",
  "ubicación",
  "direccion",
  "dirección",
  "¿Hacen envíos?",
  "envios",
  "hacen envios",
  "envios a domicilio",
  "ubicacion",
  "ubicación",
  "donde estan ubicados",
  "dónde están ubicados",
  "direccion",
  "dirección",
  "como llegar",
  "cómo llegar",
  "¿Hacen envíos?",
  "envios",
  "hacen envios",
  "envios a domicilio",
  "ubicacion",
  "donde estan ubicados",
  "direccion",
  "como llegar",
])
  .addAnswer("Estamos ubicados en Bogotá 😊:", { delay: 5000 })
  .addAnswer(
    [
      "Bogotá - Barrio El Lago",
      "Carrera 14 #80-61 (Divino Placer/Bendito Sex Store)",
      "Lunes a Sábado: 9:30 A.M a 9:30 P.M",
      "Domingos y festivos: 12:30 P.M a 7:30 P.M",
    ],
    {
      media:
        "https://lh3.googleusercontent.com/p/AF1QipO_0WIAD9JXh3Ii534fg_iM-W44WU3yiVb04Zg=s680-w680-h510",
    },
  )
  .addAnswer("¿Desde que ciudad nos hablas?", { delay: 2000, capture: true })
  .addAction(async (ctx, { flowDynamic, state }) => {
    const city: string = ctx.body.toLowerCase();

    if (!city || city.trim().length === 0) {
      return await flowDynamic(
        "No logré entender tu ciudad. ¿Podrías indicárnosla nuevamente? 😊",
        { delay: 3000 },
      );
    }

    await state.update({ city });
    if (city === "bogota" || city === "bogotá") {
      return await flowDynamic(
        "Ayúdanos con tu dirección para cotizar el envío 🚚",
        { delay: 5000 },
      );
    } else {
      return await flowDynamic(
        `Los pedidos a ${ctx.body} llegan en 24 a 48 horas hábiles.`,
        { delay: 5000 },
      );
    }
  });

const webpageFlow = addKeyword<Provider, Database>([
  "pagina",
  "página",
  "redes sociales",
]).addAnswer(
  "Puedes visitar nuestra página web en el siguiente enlace: https://divinoplacer.com.co",
  { delay: 2000 },
);

// Inicialización del bot
const main = async () => {
  const adapterFlow: FlowClass = createFlow([
    cityFlow,
    webpageFlow,
    dynamicGreetingFlow,
  ]);

  const adapterDB: Database = new Database();

  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: createProvider(Provider),
    database: adapterDB,
  });

  httpServer(3008);
};

main();
