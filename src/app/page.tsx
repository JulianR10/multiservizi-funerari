import { AnimatedCounter } from "@/components/AnimatedCounter"

import velasRosas from "@/assets/velas-rosas.webp"
import fondoHero from "@/assets/fondoHero.webp"

const services = [
  {
    title: "Servizi Funebri",
    description:
      "Organizzazione completa del funerale con cura e rispetto.",
    items: [
      "Allestimento camera ardente",
      "Composizione e vestizione della salma",
      "Trasporto funebre con auto attrezzate",
      "Esumazione ed estumulazione",
      "Disbrigo pratiche amministrative e burocratiche",
    ],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    title: "Lavori Cimiteriali",
    description:
      "Realizzazione e manutenzione di tombe e monumenti funebri.",
    items: [
      "Realizzazione e manutenzione di tombe e monumenti",
      "Ristrutturazione personalizzata di tombe",
      "Cura dell'illuminazione votiva",
      "Pulizia e risanamento di loculi",
      "Installazione di accessori cimiteriali",
    ],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Cremazioni",
    description:
      "Disbrigo completo delle pratiche per la cremazione e servizi correlati.",
    items: [
      "Pratiche burocratiche per la cremazione",
      "Trasporto della salma al forno crematorio",
      "Composizione delle ceneri in urne cinerarie",
      "Fornitura di urne in vari modelli e materiali",
      "Supporto per dispersione delle ceneri",
    ],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    ),
  },
  {
    title: "Trasporti Funebri",
    description:
      "Trasporto funebre nazionale e internazionale con mezzi moderni.",
    items: [
      "Trasporto funebre nazionale e internazionale",
      "Mezzi funebri moderni e adeguati",
      "Gestione pratiche doganali per trasporti esteri",
      "Coordinamento con agenzie estere per rimpatri",
    ],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: "Pratiche Burocratiche",
    description:
      "Gestione completa della burocrazia funeraria e cimiteriale.",
    items: [
      "Disbrigo pratiche amministrative e anagrafiche",
      "Documentazione per tumulazione e cremazione",
      "Gestione rapporti con enti locali e cimiteriali",
      "Consulenza per successioni e pratiche ereditarie",
    ],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: "Servizi Floreali",
    description:
      "Allestimenti e composizioni floreali per ogni esigenza.",
    items: [
      "Corone funebri e composizioni floreali",
      "Allestimento floreale per camera ardente",
      "Addobbi per chiesa e luogo di sepoltura",
      "Consegna rapida e puntuale",
    ],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
]

export default async function Home() {
  return (
    <>

      {/* Hero */}
      <section className="relative -mt-[90px] pt-[220px] pb-32 min-h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fondoHero.src})` }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{
            backgroundImage: `url(${fondoHero.src})`,
            maskImage: 'linear-gradient(to left, transparent 30%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to left, transparent 30%, black 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent to-75%" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="max-w-xl animate-fade-in text-3xl leading-relaxed text-white sm:text-4xl font-heading font-semibold">
            Da oltre 20 anni,<br />
            camminiamo al vostro fianco<br />
            con rispetto e dignità.
          </h1>
        </div>
      </section>

      {/* Chi Siamo */}
      <section id="chi-siamo">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-4xl font-bold text-primary sm:text-5xl">
            Chi Siamo
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-sans text-lg text-zinc-600">
            Conosci la nostra storia e i valori che ci guidano da oltre vent&apos;anni.
          </p>
          <div className="mt-12 grid items-stretch gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary">
                Petrungaro Multiservizi Funerari
              </h2>
              <p className="mt-4 font-sans text-base leading-7 text-zinc-600">
                La Petrungaro Multiservizi Funerari è un&apos;agenzia di onoranze funebri di
                Fiumefreddo Bruzio, in provincia di Cosenza, punto di riferimento da oltre
                vent&apos;anni per chi ha perso un proprio caro e ha necessità di
                un&apos;assistenza funeraria completa e professionale.
              </p>
              <p className="mt-4 font-sans text-base leading-7 text-zinc-600">
                La nostra agenzia funebre offre alla clientela un&apos;ampia gamma di servizi
                funerari, garantendo il massimo supporto e sostegno nel doloroso momento del
                lutto, nel pieno rispetto di valori come l&apos;onestà, l&apos;umanità e la
                riservatezza.
              </p>
              <h3 className="mt-10 font-heading text-3xl font-bold text-primary">
                I nostri valori
              </h3>
              <p className="mt-4 font-sans text-base leading-7 text-zinc-600">
                Ci impegniamo ogni giorno per offrire un servizio che va oltre la semplice
                organizzazione del funerale. Accompagniamo le famiglie con discrezione e
                professionalità in ogni fase, dalla gestione delle pratiche burocratiche
                fino alla cura degli ultimi desideri del proprio caro.
              </p>
              <p className="mt-4 font-sans text-base leading-7 text-zinc-600">
                La nostra squadra è reperibile 24 ore su 24, 365 giorni l&apos;anno, inclusi
                i giorni festivi, per garantirti supporto in qualsiasi momento.
              </p>
            </div>
            <div className="h-full min-h-full overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-chalk shadow-lg">
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="mt-2 font-sans text-xs text-primary/30">Immagine in arrivo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Stats */}
      <section className="bg-primary/5 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
            <div className="relative text-center">
              <AnimatedCounter value={41} />
              <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">Anni di esperienza</p>
            </div>
            <div className="relative text-center before:absolute before:left-0 before:top-0 before:hidden before:h-full before:w-px before:bg-primary/20 md:before:block">
              <AnimatedCounter value={100} suffix="%" />
              <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">Successo nei servizi</p>
            </div>
            <div className="relative text-center before:absolute before:left-0 before:top-0 before:hidden before:h-full before:w-px before:bg-primary/20 md:before:block">
              <AnimatedCounter value={500} suffix="+" />
              <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">Funerali celebrati</p>
            </div>
            <div className="relative text-center before:absolute before:left-0 before:top-0 before:hidden before:h-full before:w-px before:bg-primary/20 md:before:block">
              <div className="font-heading text-5xl font-bold text-primary sm:text-6xl">24/7</div>
              <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">Assistenza sempre disponibile</p>
            </div>
          </div>
        </div>
      </section>

      {/* Servizi */}
      <section id="servizi" className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-fixed"
          style={{
            backgroundImage: `url(${velasRosas.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 scale-110 blur-sm"
            style={{
              backgroundImage: `url(${velasRosas.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[#3a0d0e]/80" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl font-bold text-chalk sm:text-5xl">
              I nostri servizi
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-lg text-chalk/80">
              Un&apos;ampia gamma di servizi funerari per accompagnarti in ogni momento.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-xl border border-primary/10 bg-chalk/75 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:scale-110">
                  {service.icon}
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-primary">
                  {service.title}
                </h3>
                <p className="mt-2 font-sans text-sm leading-6 text-primary">
                  {service.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-sans text-sm text-primary">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Contatti */}
      <section id="contatti" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl font-bold text-primary sm:text-5xl">
              Contattaci
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-lg text-zinc-600">
              Siamo sempre a tua disposizione. Operativi 24 ore su 24, 7 giorni su 7.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="group rounded-xl border border-primary/10 bg-chalk p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-primary">WhatsApp</h3>
              <p className="mt-1 font-sans text-sm text-zinc-600">Risposta immediata via messaggio.</p>
              <div className="mt-3 space-y-1">
                <a
                  href="https://wa.me/393356691440"
                  target="_blank"
                  className="inline-flex items-center gap-1 font-sans text-sm font-medium text-primary transition-transform hover:scale-90 hover:text-primary-hover"
                >
                  +39 335 6691440
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <br />
                <a
                  href="https://wa.me/393356691117"
                  target="_blank"
                  className="inline-flex items-center gap-1 font-sans text-sm font-medium text-primary transition-transform hover:scale-90 hover:text-primary-hover"
                >
                  +39 335 6691117
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <br />
                <a
                  href="https://wa.me/393351316192"
                  target="_blank"
                  className="inline-flex items-center gap-1 font-sans text-sm font-medium text-primary transition-transform hover:scale-90 hover:text-primary-hover"
                >
                  +39 335 1316192
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="group rounded-xl border border-primary/10 bg-chalk p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-primary">Email</h3>
              <p className="mt-1 font-sans text-sm text-zinc-600">Per richieste commerciali e informazioni.</p>
              <a
                href="mailto:mf@multiservizifunerarisrl.com"
                className="mt-3 block font-sans text-sm font-medium text-primary transition-transform hover:scale-90 hover:text-primary-hover"
              >
                mf@multiservizifunerarisrl.com
              </a>
            </div>

            <div className="group rounded-xl border border-primary/10 bg-chalk p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-primary">Telefono</h3>
              <p className="mt-1 font-sans text-sm text-zinc-600">Chiamaci, siamo sempre raggiungibili.</p>
              <ul className="mt-3 space-y-1">
                <li>
                  <a href="tel:+393356691440" className="font-sans text-sm font-medium text-primary hover:text-primary-hover">
                    +39 335 6691440
                  </a>
                </li>
                <li>
                  <a href="tel:+393356691117" className="font-sans text-sm font-medium text-primary hover:text-primary-hover">
                    +39 335 6691117
                  </a>
                </li>
                <li>
                  <a href="tel:+393351316192" className="font-sans text-sm font-medium text-primary hover:text-primary-hover">
                    +39 335 1316192
                  </a>
                </li>
                <li>
                  <a href="tel:+39098271580" className="font-sans text-sm font-medium text-primary hover:text-primary-hover">
                    +39 0982 71580
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary">Dove trovarci</h2>
              <p className="mt-2 font-sans text-base text-zinc-600">
                Siamo operativi in sede e online. Passa a trovarci o contattaci digitalmente.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-zinc-900">Indirizzo</p>
                    <p className="mt-0.5 font-sans text-sm text-zinc-600">
                      Via Trento, 11, II° Trav.<br />
                      87030 Fiumefreddo Bruzio (CS)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-zinc-900">Orari</p>
                    <p className="mt-0.5 font-sans text-sm text-zinc-600">
                      Ufficio: 8:00–12:00 / 14:00–18:00
                    </p>
                    <p className="font-sans text-sm text-zinc-600">
                      Cellulare: 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl shadow-lg">
              <iframe
                src="https://www.google.com/maps?q=39.24747906719861,16.05949833693508&z=20&output=embed"
                width="100%"
                height="360"
                className="border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mappa di Fiumefreddo Bruzio"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
