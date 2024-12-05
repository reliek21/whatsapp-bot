import { MemoryDB as Database } from '@builderbot/bot';
import FlowClass from '@builderbot/bot/dist/io/flowClass';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { ActionPropertiesKeyword } from '@builderbot/bot/dist/types';
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';

const options: ActionPropertiesKeyword = {
  capture: true,
  delay: 9000,
};

const standardMessages = [
  'Mi nombre es Sofía y seré su asesora el día de hoy, ¿con quién tengo el gusto de hablar?',
  'Estamos ubicados en Bogotá. ¿De qué ciudad te comunicas con nosotros?'
];

const morningFlow = addKeyword<Provider, Database>(['buenos días', 'dias', 'buenos dias', 'hola, buenos dias'])
  .addAnswer('Hola Buenos días 🌞', { delay: 3000 })
  .addAnswer(standardMessages, options);

const afternoonFlow = addKeyword<Provider, Database>(['buenas tardes', 'tardes', 'hola, buenas tardes'])
  .addAnswer('Hola Buenas tardes 🌞', { delay: 3000 })
  .addAnswer(standardMessages, options);

const nightFlow = addKeyword<Provider, Database>(['buenas noches', 'noches', 'hola, buenas noches'])
  .addAnswer('Hola Buenas noches 🌜', { delay: 3000 })
  .addAnswer(standardMessages, options);

const dispoFlow = addKeyword<Provider, Database>([
  'hola, tienes disponibilidad',
  'disponibilidad',
  'tienes disponibilidad',
  'tienes disponibilidad hoy',
  'tienes disponibilidad mañana',
  'tienes disponibilidad esta semana',
  'Hola, estoy buscando',
  '¡Hola! 😊 Tropecé con su sitio web y me picó la curiosidad',
  'Hola, tienes',
]).addAnswer(standardMessages, options);

const sendLocationFlow = addKeyword<Provider, Database>([
  '¿Hacen envíos?',
  'envios',
  'hacen envios',
  'hacen envios a domicilio',
  'hacen envios a bogota',
  'envios a domicilio',
  'envios a bogota',
]).addAction(async (_, { flowDynamic }) => {
  return flowDynamic('Si, hacemos envíos a todo el país 🚚. ¿En qué ciudad te encuentras?');
}).addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
  await state.update({ name: ctx.body })

  if (ctx.body.toLowerCase() === 'bogotá' || ctx.body.toLowerCase() === 'bogota') {
    return flowDynamic([
      'Ayudanos con tu dirección para cotizar el envío 🚚',
    ]);
  } else {
    return flowDynamic([
      `En ${ctx.body} legaría en 24 a 48 horas d¿ías hábiles.`,
    ]);
  }
});

const locationFlow = addKeyword<Provider, Database>([
  'bogotá',
  'ubicacion',
  'donde estan ubicados',
  'como los encuentro',
  'Donde están ubicados?',
  'Donde están ubicados',
  'direccion',
  'dirección',
  'donde estan',
  'ubicación',
  'como llegar',
  'como llegar a la tienda',
  'como llegar a la tienda de bogota'
]).addAnswer('Nos puedes visitar en la siguiente ubicación 😊:', { delay: 5000 })
  .addAnswer([
    'Bogotá - Barrio El Lago',
    'Carrera 14 #80-61 (Divino Placer/Bendito Sex Store)',
    'Lunes a Sábado: 9 :30A.M a 9:30 P.M',
    'Festivos: 12:30 P.M a 7:30 P.M'
  ], {
    media: 'https://lh3.googleusercontent.com/p/AF1QipO_0WIAD9JXh3Ii534fg_iM-W44WU3yiVb04Zg=s680-w680-h510'
  });

// We can ask here for the name of the user
const mainFlow = addKeyword(['dv-palabra-clave'])
  .addAction(async (_, { flowDynamic }) => {
    return flowDynamic('Hola, Bienvenido a Divino PLacer, con quien tenemos el gusto de hablar?');
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ name: ctx.body })
    return flowDynamic(`Hola, ${ctx.body}, bienvenido a Divino Placer! 😊`);
  });

const main = async () => {
  const adapterFlow: FlowClass = createFlow([
    morningFlow,
    afternoonFlow,
    nightFlow,
    locationFlow,
    mainFlow,
    dispoFlow,
    sendLocationFlow
  ])

  // const adapterProvider = createProvider(Provider)
  const adapterDB: Database = new Database()

  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: createProvider(Provider),
    database: adapterDB,
  });

  httpServer(3008)
}

main()
