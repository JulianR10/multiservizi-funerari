import Image from "next/image"
import { AnimatedCounter } from "@/components/AnimatedCounter"
import { ScrollReveal } from "@/components/ScrollReveal"
import { COMPANY } from "@/lib/company"

import velasRosas from "@/assets/velas-rosas.webp"
import fondoHero from "@/assets/fondoHero.webp"

const services = [
  {
    title: "Servizi Funebri",
    description:
      "Organizzazione completa del funerale con cura e rispetto, inclusi trasporti e allestimenti floreali.",
    items: [
      "Allestimento camera ardente",
      "Composizione e vestizione della salma",
      "Trasporto funebre",
      "Corone floreali e allestimenti",
      "Esumazione ed estumulazione",
      "Disbrigo pratiche amministrative",
    ],
    image: "https://images.unsplash.com/photo-1544813545-4827b64fcacb?w=800&h=480&fit=crop&q=80",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    title: "Lavori Cimiteriali",
    description:
      "Realizzazione e manutenzione di tombe e monumenti funebri con attenzione ai dettagli.",
    items: [
      "Realizzazione tombe e monumenti",
      "Ristrutturazione personalizzata",
      "Cura dell'illuminazione votiva",
      "Pulizia e risanamento loculi",
      "Accessori cimiteriali",
      "Manutenzione giardini",
    ],
    image: "https://images.unsplash.com/photo-1590239549758-4c4bcc36971c?w=800&h=480&fit=crop&q=80",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Cremazioni",
    description:
      "Disbrigo completo delle pratiche per la cremazione e servizi correlati con professionalità.",
    items: [
      "Pratiche burocratiche per la cremazione",
      "Trasporto al forno crematorio",
      "Composizione ceneri in urne",
      "Fornitura urne cinerarie",
      "Supporto dispersione ceneri",
      "Custodia ceneri",
    ],
    image: "https://images.unsplash.com/photo-1659902374294-0a97f40b8877?w=800&h=480&fit=crop&q=80",
    imagePosition: "center 100%",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    ),
  },
  {
    title: "Arte Funeraria",
    description:
      "Lapidi, ceramiche, vetro e oggetti commemorativi personalizzati con la foto del tuo caro.",
    items: [
      "Lapidi in granito, marmo e ceramica",
      "Oggettistica con foto incisa",
      "Targhe e medaglioni su misura",
      "Composizioni in vetro artistico",
      "Giardiniere e arredi personalizzati",
      "Bassorilievi e incisioni",
    ],
    image: "https://images.unsplash.com/photo-1512090967618-c9d67f852cec?w=800&h=480&fit=crop&q=80",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
]

export default async function Home() {
  return (
    <>

      {/* Hero */}
      <section className="relative -mt-[90px] pt-[220px] pb-32 min-h-[600px] overflow-hidden">
        <Image
          src={fondoHero}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm saturate-0"
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
      <ScrollReveal>
        <section id="chi-siamo" className="scroll-mt-24">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid items-stretch gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary">
                Chi Siamo
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
            <div className="h-full min-h-full overflow-hidden rounded-xl bg-primary/5 shadow-lg">
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-3 font-heading text-lg font-medium text-primary/30">In memoria</p>
                  <p className="mt-1 font-sans text-xs text-primary/20">Prossimamente</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Stats */}
      <section className="bg-primary/5 py-20 shadow-[0_-6px_20px_-8px_rgba(0,0,0,0.3)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
            <ScrollReveal delay={0}>
              <div className="relative text-center">
                <AnimatedCounter value={41} />
                <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">Anni di esperienza</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:hidden before:h-full before:w-px before:bg-primary/20 md:before:block">
                <AnimatedCounter value={100} suffix="%" />
                <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">Successo nei servizi</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:hidden before:h-full before:w-px before:bg-primary/20 md:before:block">
                <AnimatedCounter value={500} suffix="+" />
                <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">Funerali celebrati</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:hidden before:h-full before:w-px before:bg-primary/20 md:before:block">
                <div className="font-heading text-5xl font-bold text-primary sm:text-6xl">24/7</div>
                <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">Assistenza sempre disponibile</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Servizi */}
      <section id="servizi" className="scroll-mt-24 relative px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${velasRosas.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
          }}
        />
        <div className="absolute inset-0 bg-[#3a0d0e]/85 backdrop-blur-sm" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl font-bold text-chalk sm:text-5xl">
              I nostri servizi
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-lg text-chalk/80">
              Un&apos;ampia gamma di servizi funerari per accompagnarti in ogni momento.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {services.map((service, i) => (
              <ScrollReveal key={service.title} delay={i * 100}>
                <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={service.imagePosition ? { objectPosition: service.imagePosition } : undefined}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  <div className="p-6 bg-chalk-dark/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {service.icon}
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-zinc-900">
                        {service.title}
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                      {service.description}
                    </p>

                    <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                      {service.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          <span className="text-xs text-zinc-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* Contatti */}
      <section id="contatti" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl font-bold text-primary sm:text-5xl">
              Contattaci
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-lg text-zinc-600">
              Siamo sempre a tua disposizione. Operativi 24 ore su 24, 7 giorni su 7.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-6xl text-center">
            <ScrollReveal delay={0}>
              <div className="flex flex-col gap-0 sm:flex-row">
                <div className="flex-1 px-4">
                  <p className="font-heading text-lg font-semibold text-primary/60 tracking-widest uppercase">Telefono</p>
                  <p className="mt-1 font-sans text-sm text-zinc-400">Sempre raggiungibili, 24/7.</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <a href="https://wa.me/393356691440" target="_blank" className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-1.102-.984-1.833-2.1-2.047-2.455-.214-.356-.022-.548.162-.724.166-.157.373-.403.56-.605.187-.203.249-.348.374-.58.124-.232.062-.435-.031-.61-.093-.173-.67-1.61-.917-2.204-.242-.579-.487-.48-.67-.49-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      6691440
                    </a>
                    <a href="https://wa.me/393356691117" target="_blank" className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-1.102-.984-1.833-2.1-2.047-2.455-.214-.356-.022-.548.162-.724.166-.157.373-.403.56-.605.187-.203.249-.348.374-.58.124-.232.062-.435-.031-.61-.093-.173-.67-1.61-.917-2.204-.242-.579-.487-.48-.67-.49-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      6691117
                    </a>
                    <a href="https://wa.me/393351316192" target="_blank" className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-1.102-.984-1.833-2.1-2.047-2.455-.214-.356-.022-.548.162-.724.166-.157.373-.403.56-.605.187-.203.249-.348.374-.58.124-.232.062-.435-.031-.61-.093-.173-.67-1.61-.917-2.204-.242-.579-.487-.48-.67-.49-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      1316192
                    </a>
                  </div>
                  <div className="mt-3 pt-3">
                    <a href="tel:+39098271580" className="inline-flex items-center gap-2 font-sans text-lg font-medium text-primary hover:text-primary-hover">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      Chiama +39 0982 71580
                    </a>
                  </div>
                </div>

                <div className="mx-auto my-6 h-px w-3/4 bg-zinc-200 sm:my-0 sm:h-auto sm:w-px" />

                <div className="flex-1 px-4">
                  <p className="font-heading text-lg font-semibold text-primary/60 tracking-widest uppercase">Email</p>
                  <p className="mt-1 font-sans text-sm text-zinc-400">Per richieste commerciali e informazioni.</p>
                  <a href={`mailto:${COMPANY.email}`} className="mt-3 inline-flex items-center gap-1 font-sans text-xl font-medium text-primary hover:text-primary-hover">
                    {COMPANY.email}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>

                <div className="mx-auto my-6 h-px w-3/4 bg-zinc-200 sm:my-0 sm:h-auto sm:w-px" />

                <div className="flex-1 px-4">
                  <p className="font-heading text-lg font-semibold text-primary/60 tracking-widest uppercase">Ufficio</p>
                  <p className="mt-1 font-sans text-sm text-zinc-400">{COMPANY.ufficioOrari}</p>
                  <p className="mt-3 font-sans text-base text-zinc-600">
                    {COMPANY.address}<br />
                    {COMPANY.city}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="mx-auto mt-10 max-w-4xl h-72 overflow-hidden rounded-2xl shadow-lg">
                <iframe
                  src="https://www.google.com/maps?q=39.24747906719861,16.05949833693508&z=15&output=embed"
                  width="100%"
                  height="100%"
                  className="border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mappa di Fiumefreddo Bruzio"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  )
}
