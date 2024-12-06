import { MemoryDB as Database } from '@builderbot/bot';
import FlowClass from '@builderbot/bot/dist/io/flowClass';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';

// standard messages
const standardMessages: string = 'Mi nombre es Sofía y seré su asesora el día de hoy, ¿con quién tengo el gusto de hablar?';

// get the current time to determine the greeting flow
const getGreetingFlow = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morningFlow';
  if (hour >= 12 && hour < 18) return 'afternoonFlow';
  return 'nightFlow';
};

const greetingStandard: string | [string, ...string[]] = [
  'saludo', 'saludar', 'saludos', 'hola',
  'buenos dias', 'buenos días',
  'buenas tardes', 'buenas noches',
  'buenos días', 'dias', 'buenos dias', 'hola, buenos dias',
  'buenas tardes', 'tardes', 'hola, buenas tardes',
  'buenas noches', 'noches', 'hola, buenas noches',
  'hola, tienes disponibilidad',
  'disponibilidad',
  'tienes disponibilidad',
  '¡Hola! 😊 Tropecé con su sitio web y me picó la curiosidad',
  'Hola, tienes',
];

// dynamic greeting flow
const dynamicGreetingFlow = addKeyword<Provider, Database>(greetingStandard)
  .addAction(async (_, { flowDynamic }) => {
    const greetingFlow = getGreetingFlow();
    if (greetingFlow === 'morningFlow') {
      return flowDynamic('Hola, Buenos días 🌞');
    } else if (greetingFlow === 'afternoonFlow') {
      return flowDynamic('Hola, Buenas tardes 🌞');
    } else {
      return flowDynamic('Hola, Buenas noches 🌜');
    }
  }).addAnswer(standardMessages, { delay: 2000, capture: true })
  .addAction(async (ctx, { flowDynamic, state }) => {
    const name: string = ctx.body.toLowerCase();
    await state.update({ name });

    return await flowDynamic(
      `Hola, ${name}, Bienvenid@ a Divino Placer 😊, ¿En qué puedo ayudarte el día de hoy?`,
      { delay: 5000 }
    );
  }).addAnswer('¿Estas en busca de un producto en especifico?', { delay: 3000 });

const cityFlow = addKeyword<Provider, Database>([
  'donde estan ubicados', 'dónde están ubicados',
  'ubicacion', 'ubicación',
  'direccion', 'dirección',
  '¿Hacen envíos?',
  'envios',
  'hacen envios',
  'envios a domicilio',
  'ubicacion', 'ubicación',
  'donde estan ubicados', 'dónde están ubicados',
  'direccion', 'dirección',
  'como llegar', 'cómo llegar',
  '¿Hacen envíos?',
  'envios',
  'hacen envios',
  'envios a domicilio',
  'ubicacion', 'donde estan ubicados', 'direccion', 'como llegar',
]).addAnswer('Estamos ubicados en Bogotá 😊:', { delay: 5000 })
  .addAnswer([
    'Bogotá - Barrio El Lago',
    'Carrera 14 #80-61 (Divino Placer/Bendito Sex Store)',
    'Lunes a Sábado: 9:30 A.M a 9:30 P.M',
    'Domingos y festivos: 12:30 P.M a 7:30 P.M'
  ], {
    media: 'https://lh3.googleusercontent.com/p/AF1QipO_0WIAD9JXh3Ii534fg_iM-W44WU3yiVb04Zg=s680-w680-h510'
  }).addAnswer('¿Desde que ciudad nos hablas?', { delay: 2000, capture: true })
  .addAction(async (ctx, { flowDynamic, state }) => {
    const city: string = ctx.body.toLowerCase();
    await state.update({ city });

    if (city === 'bogota' || city === 'bogotá') {
      return await flowDynamic('Ayúdanos con tu dirección para cotizar el envío 🚚', { delay: 5000 });
    } else {
      return await flowDynamic(`Los pedidos a ${ctx.body} llegan en 24 a 48 horas hábiles.`, { delay: 5000 });
    }
  });

const webpageFlow = addKeyword<Provider, Database>([
  'web',
  'pagina', 'página',
  'sitio web',
  'redes sociales'
]).addAnswer('Puedes visitar nuestra página web en el siguiente enlace: https://divinoplacer.com.co', { delay: 2000 });

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

  httpServer(3008); // Puerto del servidor
};

main();
