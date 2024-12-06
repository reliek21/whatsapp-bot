import { MemoryDB as Database } from '@builderbot/bot';
import FlowClass from '@builderbot/bot/dist/io/flowClass';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { ActionPropertiesKeyword } from '@builderbot/bot/dist/types';
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';

// gloabal options
const defaultOptions: ActionPropertiesKeyword = {
  capture: true,
  delay: 9000,
};

// standard messages
const standardMessages = [
  'Mi nombre es Sofía y seré su asesora el día de hoy, ¿con quién tengo el gusto de hablar?',
  'Estamos ubicados en Bogotá. ¿De qué ciudad te comunicas con nosotros?',
];

// get the current time to determine the greeting flow
const getGreetingFlow = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morningFlow';
  if (hour >= 12 && hour < 18) return 'afternoonFlow';
  return 'nightFlow';
};

const greetingStandard: string | [string, ...string[]] = [
  'saludo', 'saludar', 'saludos', 'hola', 'buenos dias', 'buenas tardes', 'buenas noches'
];

// dynamic greeting flow
const dynamicGreetingFlow = addKeyword<Provider, Database>(greetingStandard)
  .addAction(async (_, { flowDynamic }) => {
    const greetingFlow = getGreetingFlow();
    if (greetingFlow === 'morningFlow') {
      return flowDynamic('Hola Buenos días 🌞');
    } else if (greetingFlow === 'afternoonFlow') {
      return flowDynamic('Hola Buenas tardes 🌞');
    } else {
      return flowDynamic('Hola Buenas noches 🌜');
    }
  }).addAnswer(standardMessages, defaultOptions);

// location flow
const locationFlow = addKeyword<Provider, Database>([
  'ubicacion', 'donde estan ubicados', 'direccion', 'como llegar',
]).addAnswer('Nos puedes visitar en la siguiente ubicación 😊:', { delay: 5000 })
  .addAnswer([
    'Bogotá - Barrio El Lago',
    'Carrera 14 #80-61 (Divino Placer/Bendito Sex Store)',
    'Lunes a Sábado: 9:30 A.M a 9:30 P.M',
    'Domingos y festivos: 12:30 P.M a 7:30 P.M'
  ], {
    media: 'https://lh3.googleusercontent.com/p/AF1QipO_0WIAD9JXh3Ii534fg_iM-W44WU3yiVb04Zg=s680-w680-h510'
  });

// Inicialización del bot
const main = async () => {
  const adapterFlow: FlowClass = createFlow([
    dynamicGreetingFlow,
    locationFlow,
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
