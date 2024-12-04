import { MemoryDB as Database } from '@builderbot/bot';
import FlowClass from '@builderbot/bot/dist/io/flowClass';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { ActionPropertiesKeyword, TFlow } from '@builderbot/bot/dist/types';
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot';

import { welcomeEntry } from './entry/welcome.entry';

const options: ActionPropertiesKeyword = {
  capture: true,
  delay: 5000,
};

const standardMessages = [
  'Mi nombre es Sofía y seré su asesora el día de hoy, ¿con quién tengo el gusto de hablar?',
  'Estamos ubicados en Bogotá. ¿De qué ciudad te comunicas con nosotros ?'
];

const morningFlow = addKeyword<Provider, Database>(['buenos días', 'buenos dias'])
  .addAnswer('Hola Buenos días 🌞')
  .addAnswer(standardMessages, options);

const afternoonFlow = addKeyword<Provider, Database>(['buenas tardes'])
  .addAnswer('Hola Buenas tardes 🌞')
  .addAnswer(standardMessages, options);

const nightFlow = addKeyword<Provider, Database>(['buenas noches'])
  .addAnswer('Hola Buenas noches 🌜')
  .addAnswer(standardMessages, options);

const locationFlow = addKeyword<Provider, Database>(['bogotá', 'ubicacion'])
  .addAnswer('Visítanos 😊')
  .addAnswer([
    'Bogotá - Barrio El Lago',
    'Carrera 14 #80-61 (Divino Placer/Bendito Sex Store)',
    'Lunes a Sábado: 9 :30A.M a 9:30 P.M',
    'Festivos: 12:30 P.M a 7:30 P.M'
  ], {
    ...options,
    buttons: [
      {
        body: 'Ubicación en Google Maps 🗺️',
      }
    ]
  });

// Podemos preguntar el nombre aqui
const mainFlow = addKeyword(['example', 'Hi'])
  .addAction(async (_, { flowDynamic }) => {
    return flowDynamic('Hi! how can I help you?');
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ name: ctx.body })
    return flowDynamic(`Hello ${ctx.body}, nice to meet) you!`);
  })



const welcomeFlow: TFlow<Provider, Database> = addKeyword<Provider, Database>(welcomeEntry)
  .addAnswer('Hola, Bienvenid@ a Divino Placer! 😊')
  .addAnswer(
    [
      'Espero te encuentres bien, te invito a conocer más sobre nosotros',
      '👉 puedes visitarnos en https://divinoplacer.com',
    ].join('\n'),
    { delay: 2000, capture: true, buttons: [{
      body: 'doc',
    }] },
    // [discordFlow] -> This line is commented out because the `discordFlow` variable is not defined in this file
  );

const registerFlow = addKeyword<Provider, Database>(utils.setEvent('REGISTER_FLOW'))
  .addAnswer(`What is your name?`, { capture: true }, async (ctx, { state }) => {
    await state.update({ name: ctx.body })
  }, morningFlow)
  .addAnswer('What is your age?', { capture: true }, async (ctx, { state }) => {
    await state.update({ age: ctx.body })
  })
  .addAction(async (_, { flowDynamic, state }) => {
    await flowDynamic(`${state.get('name')}, thanks for your information!: Your age: ${state.get('age')}`)
  })

const fullSamplesFlow = addKeyword<Provider, Database>(['samples', utils.setEvent('SAMPLES')])
  .addAnswer(`💪 I'll send you a lot files...`)
  // .addAnswer(`Send image from Local`, { media: join(process.cwd(), 'assets', 'sample.png') })
  .addAnswer(`Send video from URL`, {
    media: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4',
  })
  .addAnswer(`Send audio from URL`, { media: 'https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3' })
  .addAnswer(`Send file from URL`, {
    media: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  })

const main = async () => {
  const adapterFlow: FlowClass = createFlow([
    morningFlow,
    afternoonFlow,
    nightFlow,
    locationFlow,
    welcomeFlow,
    registerFlow,
    fullSamplesFlow,
    mainFlow
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
