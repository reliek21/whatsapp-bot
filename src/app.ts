import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

const PORT = process.env.PORT ?? 3008

const discordFlow = addKeyword<Provider, Database>('doc').addAnswer(
  ['You can see the documentation here', '📄 https://builderbot.app/docs \n', 'Do you want to continue? *yes*'].join(
    '\n'
  ),
  { capture: true },
  async (ctx, { gotoFlow, flowDynamic }) => {
    if (ctx.body.toLocaleLowerCase().includes('yes')) {
      return gotoFlow(registerFlow)
    }
    await flowDynamic('Thanks!')
    return
  }
)

const welcomeFlow = addKeyword<Provider, Database>(['hi', 'hello', 'hola'])
  .addAnswer(`🙌 Hello welcome to this *Chatbot*`)
  .addAnswer(
    [
      'I share with you the following links of interest about the project',
      '👉 *doc* to view the documentation',
    ].join('\n'),
    { delay: 800, capture: true },
    async (ctx, { fallBack }) => {
      if (!ctx.body.toLocaleLowerCase().includes('doc')) {
        return fallBack('You should type *doc*')
      }
      return
    },
    [discordFlow]
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
  const adapterFlow = createFlow([welcomeFlow, registerFlow, fullSamplesFlow])

  // const adapterProvider = createProvider(Provider)
  const adapterDB = new Database()

  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: createProvider(Provider),
    database: adapterDB,
  });

  httpServer(+PORT)
}

main()
