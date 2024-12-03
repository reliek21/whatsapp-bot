import { join } from 'path';
import { TFlow } from '@builderbot/bot/dist/types';
import { MemoryDB as Database } from '@builderbot/bot';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot';
import { welcomeEntry } from './entry/welcome.entry';
import FlowClass from '@builderbot/bot/dist/io/flowClass';

const PORT: number | string = Number(process.env.PORT) ?? 3008;

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
  )

const registerFlow = addKeyword<Provider, Database>(utils.setEvent('REGISTER_FLOW'))
  .addAnswer(`What is your name?`, { capture: true }, async (ctx, { state }) => {
    await state.update({ name: ctx.body })
  })
  .addAnswer('What is your age?', { capture: true }, async (ctx, { state }) => {
    await state.update({ age: ctx.body })
  })
  .addAction(async (_, { flowDynamic, state }) => {
    await flowDynamic(`${state.get('name')}, thanks for your information!: Your age: ${state.get('age')}`)
  })

const fullSamplesFlow = addKeyword<Provider, Database>(['samples', utils.setEvent('SAMPLES')])
  .addAnswer(`💪 I'll send you a lot files...`)
  .addAnswer(`Send image from Local`, { media: join(process.cwd(), 'assets', 'sample.png') })
  .addAnswer(`Send video from URL`, {
    media: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4',
  })
  .addAnswer(`Send audio from URL`, { media: 'https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3' })
  .addAnswer(`Send file from URL`, {
    media: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  })

const main = async () => {
  const adapterFlow: FlowClass = createFlow([welcomeFlow, registerFlow, fullSamplesFlow])

  // const adapterProvider = createProvider(Provider)
  const adapterDB: Database = new Database()

  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: createProvider(Provider),
    database: adapterDB,
  });

  httpServer(+PORT)
}

main()
