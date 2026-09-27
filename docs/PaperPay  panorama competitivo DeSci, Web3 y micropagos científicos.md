# PaperPay: panorama competitivo DeSci, Web3 y micropagos científicos

> **Investigación histórica (corte al 24 sep 2026).** Los precios y datos de terceros pueden haber cambiado; verifícalos antes de citarlos. Algunas recomendaciones (resolver acceso abierto antes de cobrar, contrato de reparto) siguen pendientes; el estado del producto está en el [README](../README.md).

**Fecha de corte:** 24 de septiembre de 2026  
**Alcance:** mercado global, con utilidad para un pitch de hackathon y una eventual entrada desde LATAM.

## Resumen ejecutivo

PaperPay ocupa una intersección poco atendida: **acceso legal a una sola publicación científica, con precio subdólar, pagado en USDC y concedido mediante una credencial verificable sin cuenta de usuario**. La investigación no encontró un actor relevante que reúna públicamente las cinco propiedades al mismo tiempo: catálogo científico licenciado, compra por paper, precio cercano a $0.50, stablecoin y flujo HTTP 402 stateless.

Los competidores más cercanos se dividen en tres grupos que resuelven piezas distintas:

- **DeSci** descentraliza publicación, revisión, financiación o propiedad intelectual, pero normalmente promueve acceso abierto y no vende lectura individual por micropago. ResearchHub recompensa contribuciones con RSC; DeSci Publish ofrece preprints gratis y sin paywall; Molecule/VitaDAO tokenizan IP de investigación, no el derecho minorista a leer un PDF.[^1][^2][^3]
- **Infraestructura Web3** ya demuestra casi toda la experiencia de pago de PaperPay. x402 permite cobrar recursos digitales con stablecoins, sin checkout ni registro; L402 ofrece verificación stateless sobre Lightning; Coinsnap vende acceso por artículo sin cuenta. Ninguno está especializado de forma nativa en derechos, metadatos y licencias académicas.[^4][^5][^6][^7]
- **Acceso académico tradicional** sí posee relaciones editoriales y catálogos legales, pero conserva tickets altos, suscripciones, cuentas o flujos empresariales. ScienceDirect cobra normalmente $31.50 por artículo; DeepDyve ofrece suscripción personal de $59 al mes y acceso a la carta; Article Galaxy agrega alquiler y compra autorizada para organizaciones.[^8][^9][^10]

La conclusión estratégica es importante: **el protocolo de pago no es por sí solo el moat**. x402 ya es abierto, multirred y ha procesado más de 100 millones de pagos según Coinbase; Stripe también ofrece una integración x402 sobre Base. La ventaja defendible de PaperPay tendría que ser la combinación de **licencias de contenido, integración DOI/editorial, precio granular, UX académica y liquidación global para autores o publishers**.[^5][^11][^6]

El mayor riesgo no es Stellar ni el coste de red: es el **derecho a distribuir el texto completo**. En publicación tradicional, los autores suelen transferir o licenciar derechos al publisher; vender acceso a un PDF requiere autorización del titular correspondiente. Para el hackathon conviene demostrar PaperPay con papers cuyos autores conserven derechos, contenido licenciado para la prueba o documentos propios, y presentar la integración con publishers como la ruta comercial.[^12][^13]

## Definición competitiva

PaperPay se evalúa contra seis atributos:

1. **Unidad de compra:** un paper o recurso individual.
2. **Economía:** viable cerca de $0.50.
3. **Activo estable:** USDC en vez de un token volátil.
4. **Fricción:** sin cuenta, tarjeta ni suscripción.
5. **Acceso:** prueba criptográfica stateless ligada al recurso.
6. **Especialización científica:** DOI, versión, licencia, publisher y trazabilidad.

La tesis económica frente a tarjetas es sólida. Stripe publica una tarifa estándar estadounidense de 2.9% + $0.30 por transacción doméstica; sobre un cobro de $0.50, la comisión sería $0.3145, equivalente a 62.9% del ticket. En Stellar, una operación clásica tiene una tarifa mínima de inclusión de 100 stroops y el ledger cierra en pocos segundos; USDC en Stellar está diseñado para pagos casi instantáneos y de bajo coste.[^14][^15][^16]

## Competidores DeSci

### Matriz principal

| Proyecto | Modelo y problema abordado | ¿Micropago por paper? | Brecha frente a PaperPay |
|---|---|---:|---|
| **ResearchHub** | Red abierta para compartir, revisar y financiar ciencia. RSC recompensa revisión, replicación, discusión y bounties; también permite financiar propuestas.[^2][^17] | **No encontrado.** El token incentiva contribuciones y financiación, no desbloquea un paper de pago. | Requiere registro para participar plenamente y usa un token propio. PaperPay propone USDC, compra puntual y acceso inmediato sin perfil.[^18] |
| **DeSci Publish / DeSci Labs** | Red open-source de preprints con objetos de investigación versionables, datos, figuras y código. Es gratuita para autores y lectores, sin APC ni paywalls.[^3] | **No.** Su propuesta elimina el cobro al lector. | Es sustituto de los paywalls, no una vía para monetizar legalmente contenido cerrado existente. PaperPay puede monetizar una obra individual, aunque necesita derechos para hacerlo. |
| **Orvium** | Plataforma end-to-end para journals, conferencias y comunidades, con DOI, revisión transparente y anclaje opcional en blockchain. Publicar es gratis para individuos; journals y conferencias pagan planes.[^19] | **No públicamente.** Monetiza el workflow editorial. | Mejor cobertura del ciclo editorial, pero no presenta checkout subdólar, stablecoin ni acceso stateless por lectura. PaperPay es una capa de transacción, no un sistema editorial completo. |
| **Molecule** | Marketplace de IP biotecnológica: los IP-NFT vinculan contratos, datos y derechos, con acceso cifrado para el titular del token.[^1][^20] | **No.** Transacciona activos y derechos de IP de alto valor. | Resuelve financiación y propiedad de investigación, no consumo minorista de literatura. PaperPay ofrece menor complejidad y una unidad económica de $0.50. |
| **VitaDAO** | DAO que financia I+D de longevidad y gobierna activos científicos tokenizados; algunos tokens permiten decidir prioridades y licenciamiento.[^21][^22] | **No.** El comprador participa en financiación o gobernanza. | Exige entender DAO, tokens e inversión científica. PaperPay ofrece una acción conocida: pagar y leer. |
| **AntsReview** | Contratos inteligentes que permiten fijar una recompensa por revisar un trabajo; un tercero valida el cumplimiento antes de pagar al reviewer.[^23] | **No.** Es un bounty de peer review, no un paywall de lectura. | PaperPay se orienta al lector y entrega contenido; AntsReview se orienta al proceso de revisión. |

### Lectura estratégica

Los proyectos DeSci no son los rivales funcionales más cercanos. Su norma cultural es **open science**: abrir preprints, remunerar revisión, financiar investigación o tokenizar IP, mientras PaperPay acepta que seguirá existiendo contenido cerrado y reduce el coste marginal de acceder a él.[^24][^25]

Esto permite un posicionamiento complementario: PaperPay puede convertirse en la capa de pago para objetos de investigación, datasets o versiones premium dentro de ecosistemas DeSci. Sin embargo, cobrar por el manuscrito que otro servicio ya ofrece gratuitamente no crea valor; el producto necesitaría contenido exclusivo, versión de registro autorizada, anexos, datasets, cómputo o servicios adicionales.

## Micropagos Web3

### Rivales directos

| Plataforma | Modelo y experiencia | ¿Sirve para contenido individual? | Brecha o amenaza para PaperPay |
|---|---|---:|---|
| **x402 / Coinbase CDP** | Estándar abierto: el servidor responde 402 con términos; el cliente paga con stablecoin y reintenta la solicitud. No necesita checkout, formulario de tarjeta ni signup.[^5][^6] | **Sí.** Declara paywalled content como caso de uso. | Es la amenaza tecnológica principal: ya ofrece la misma primitiva HTTP y es blockchain-agnostic. No aporta catálogo, licencias ni UX científica; PaperPay debe ser una aplicación vertical y no venderse como inventor exclusivo de HTTP 402. |
| **Stripe x402** | Registra pagos x402 como PaymentIntents y usa el facilitador CDP para liquidar on-chain; su documentación actual muestra depósitos en Base y requiere cuenta y aprobación del comercio.[^11] | **Sí**, para recursos y pagos machine-to-machine. | Puede atraer publishers que ya usan Stripe. PaperPay puede diferenciarse con Stellar, costes de red, integración DOI y onboarding específico, pero Stripe tiene ventaja en compliance y distribución comercial. |
| **L402 / Lightning Labs** | HTTP 402 + factura Lightning + macaroon. El preimage del pago activa una credencial y el endpoint verifica acceso sin consultar una base de pagos.[^26][^7] | **Sí**, para APIs y recursos digitales. | Iguala o supera la narrativa “stateless”. Su debilidad relativa es usar sats, con volatilidad y mayor complejidad de Lightning para usuarios no cripto; PaperPay ofrece precio estable en USDC y orientación humana/científica. |
| **Coinsnap / BTCPay Paywall** | Plugin gratuito de WordPress que bloquea posts o secciones; Lightning desbloquea al instante, sin cuenta ni suscripción. Puede ser no custodial y conectarse a BTCPay Server.[^4][^27] | **Sí**, pay-per-article. | Es muy cercano en UX, pero está limitado principalmente al ecosistema WordPress/Bitcoin y no gestiona licencias académicas. PaperPay añade stablecoin, DOI y una API desacoplada del CMS. |
| **Dropp** | Plataforma pay-by-bank y stablecoin construida sobre RTP estadounidense y Hedera; soporta pay-per-use y tickets desde un centavo.[^28][^29] | **Sí**, de forma genérica. | Tiene fiat y USDC, lo cual reduce fricción para usuarios mainstream. Está centrada en pagos, no en acceso científico ni credenciales stateless; además, su orientación a rails estadounidenses puede ser menos global que una wallet abierta. |
| **SatoshiPay** | Nació como infraestructura de micropagos para publishers, con widget y wallet en navegador; migró a Stellar para reducir coste y latencia. Históricamente permitía pagar desde 1 penique por artículos, video o audio.[^30][^31] | **Sí, históricamente.** | Es el precedente más parecido por contenido + Stellar. Su web actual enfatiza pagos cross-border mediante Pendulum/Vortex, no un producto visible de paywall científico; PaperPay puede reclamar especialización y una arquitectura 402 moderna, no que la idea de micropago sobre Stellar sea nueva.[^32] |
| **Web Monetization / Interledger** | Estándar abierto que transmite pequeños pagos mientras el usuario navega, mediante wallet y navegador/extensión compatibles; también permite pagos únicos.[^33][^34] | **Sí**, por consumo, más que por compra discreta. | Es excelente para streaming y privacidad, pero necesita extensión/configuración de wallet y no liga necesariamente un pago único a una licencia de paper. Coil, su implementación comercial más conocida, cerró en 2023.[^35] |
| **Access Protocol** | Reemplaza la suscripción con staking del token ACS en pools de creadores; el acceso continúa mientras el stake permanece.[^36] | **No en el sentido de compra puntual.** Es una suscripción tokenizada. | Introduce token propio, staking y exposición económica. PaperPay es más simple, usa una unidad estable y cobra exactamente por el paper solicitado. |

### Observación clave

“HTTP 402” por sí solo no está completamente estandarizado: MDN todavía lo describe como un código no estándar reservado para uso futuro y sin una convención universal. PaperPay debería especificar en el pitch si implementa **x402 compatible**, un esquema propio sobre 402 o una extensión para Stellar; la interoperabilidad será más creíble que presentar un protocolo aislado.[^37]

La oportunidad específica de Stellar sigue siendo convincente. Circle describe USDC en Stellar como una vía de pagos transfronterizos casi instantáneos y de bajo coste, y Stellar permite transacciones patrocinadas para que un relayer pague XLM mientras el usuario cubre la comisión con otro token. Esto puede sostener una experiencia en la que el lector solo vea “0.50 USDC”, sin mantener XLM, siempre que wallet, trustline, firma y patrocinio estén resueltos.[^38][^15]

## Alternativas tradicionales

### Plataformas comerciales

| Alternativa | Modelo actual | Cómo resuelve acceso | Brecha frente a PaperPay |
|---|---|---|---|
| **ScienceDirect / Elsevier PPV** | Compra individual inmediata con tarjeta; precio normal de $31.50, con títulos entre $19.95 y $39.95. El contenido comprado puede descargarse y el acceso web dura 48 horas.[^8] | Legal, versión de registro y catálogo propio. | Ticket 40–80 veces mayor que $0.50, carrito y rail de tarjeta. Su ventaja decisiva es que controla los derechos y el inventario. |
| **Springer Nature Link** | “Buy article PDF” añade el artículo al carrito desde la página del abstract.[^39] | Compra individual legal directamente al publisher. | Compra transaccional, pero no micropago, stablecoin ni acceso stateless. Al igual que Elsevier, posee la relación editorial que PaperPay tendría que negociar. |
| **DeepDyve LitHub** | Suscripción personal de $59/mes o $499/año, con lectura ilimitada de su colección; su tabla comercial también muestra streaming a la carta de $15 con expiración a 30 días en determinados planes.[^40][^9] | Agrega millones de papers licenciados y combina streaming, compra y herramientas de investigación. | Mucho más barato que comprar repetidamente al publisher, pero aún exige cuenta/suscripción y el precio puntual no es subdólar. Tiene una ventaja de catálogo y acuerdos que PaperPay no obtiene por tecnología. |
| **JSTOR JPASS** | $19.50/mes o $199/año, lectura ilimitada de más de 2,400 journals y 10 o 120 descargas según plan.[^41][^42] | Suscripción individual para investigadores sin acceso institucional. | Buena economía para lectores recurrentes, pero no es pay-per-paper, requiere relación continua y está limitado al catálogo JPASS. |
| **Article Galaxy** | Agrega contenido suscrito, open access y on-demand; permite alquilar o comprar artículos de publishers principales, orientado a equipos y organizaciones.[^10][^43] | Encuentra la ruta legal de menor coste y entrega documentos. | Es fuerte en catálogo, compliance y procurement, pero hereda cargos editoriales y workflows corporativos. En un caso universitario publicado, cada artículo cuesta £30.[^44] |
| **CCC Marketplace / RightFind** | Compra de un solo documento para individuos y document delivery/licencias para organizaciones.[^45][^46] | Centraliza permisos, compra y entrega autorizada. | Resuelve derechos y auditoría mejor que una startup de pagos, pero no ofrece la experiencia wallet-first, subdólar y sin registro. |
| **GetFTR + SeamlessAccess** | Comprueba en tiempo real si una institución ya da derecho a un DOI y enlaza al texto; SeamlessAccess facilita autenticación federada.[^47][^48] | Reduce paywalls falsos y pasos de login para usuarios institucionales. | No vende acceso nuevo ni ayuda al independiente sin entitlement. PaperPay puede usar una comprobación OA/institucional antes de cobrar para evitar pagos innecesarios. |

### Open access y rutas gratuitas

| Alternativa | Modelo | Efecto competitivo | Brecha u oportunidad para PaperPay |
|---|---|---|---|
| **Unpaywall** | Base y extensión que localiza copias legales gratuitas por DOI en más de 50,000 publishers y repositorios.[^49][^50] | Sustituto gratuito cuando existe una copia OA. | PaperPay no debe cobrar si Unpaywall encuentra una versión legal; integrarlo mejora confianza y convierte el pago en último recurso. |
| **CORE** | Agregador global de publicaciones OA; el estudio de plataforma reportó 32.8 millones de textos completos en 2023.[^51] | Reduce el universo realmente pagable. | Puede ser fuente de resolución gratuita y metadatos, no un rival de pago. |
| **OpenAlex** | Catálogo abierto de investigación; estima que 121 millones de unos 322 millones de trabajos, 37%, tienen alguna URL gratuita bajo su definición.[^52] | Muestra que una parte sustancial del inventario ya es gratuita. | PaperPay debería clasificar DOI por OA/cerrado antes de mostrar el paywall y concentrarse en el segmento realmente cerrado. |
| **Biblioteca, préstamo interbibliotecario y autor** | El usuario busca acceso institucional, repositorio, ILL/document delivery o solicita una copia al autor.[^53][^54] | Gratis o barato, pero puede implicar autenticación, espera y varios pasos. | PaperPay gana cuando la urgencia vale $0.50 y el acceso es inmediato; pierde si la copia legal gratuita está disponible en segundos. |
| **Sci-Hub, informal** | Ofrece copias no autorizadas sin precio al lector. Tribunales estadounidenses concedieron injunctions y daños contra el servicio; India ordenó bloquear dominios en 2025.[^55][^56] | Sustituto gratuito con enorme conveniencia percibida, pero con riesgo legal, de seguridad y disponibilidad. | PaperPay no puede competir con “gratis” solo en precio; debe vender legalidad, versión correcta, disponibilidad, trazabilidad, calidad y compensación al titular. |

## Mapa de posicionamiento

| Grupo | Precio marginal | Fricción | Derechos científicos | Cercanía competitiva |
|---|---:|---|---|---|
| Publishers PPV | Alto | Carrito/tarjeta | Muy fuertes | Rival por la misma necesidad del lector |
| DeepDyve / JPASS | Medio por suscripción | Cuenta y plan | Fuertes, catálogo parcial | Sustituto para lectores frecuentes |
| Article Galaxy / CCC | Alto o variable | Workflow empresarial | Muy fuertes | Competidor B2B y potencial socio |
| OA / bibliotecas | Gratis | De baja a alta | Legal | Sustituto prioritario |
| Sci-Hub | Gratis | Baja | No autorizado | Sustituto informal |
| DeSci | Generalmente gratis | Wallet/cuenta/comunidad | Depende del autor/proyecto | Adyacente o socio |
| x402 / L402 / paywalls cripto | Subdólar viable | Muy baja tras configurar wallet | No incluidos | Rival tecnológico o infraestructura |
| **PaperPay** | **Objetivo $0.50** | **Firma y acceso** | **Por construir** | **Único si une licencia + ciencia + UX 402** |

Los rivales con **derechos** carecen de la economía y experiencia de PaperPay; los rivales con **micropagos** carecen de derechos y especialización científica. Esa separación es la ventana de mercado, pero también la principal dependencia comercial.

## Ventaja defendible

### Lo que sí diferencia

- **Verticalización científica:** resolver DOI, versión de registro, licencia, retractaciones, embargo, publisher y entitlement antes del cobro.
- **Precio predecible:** USDC evita que el lector tenga que razonar en sats o tokens de protocolo; Circle mantiene USDC nativo en Stellar.[^15][^57]
- **Acceso como credencial:** el pago firmado puede producir un token de acceso ligado a DOI, recurso, importe y expiración, verificable sin cuenta.
- **Integración respetuosa del acceso gratuito:** comprobar Unpaywall/OpenAlex, biblioteca o entitlement antes del 402; PaperPay cobra solo cuando no hay una ruta legal gratuita.
- **Liquidación programable:** reparto automático publisher–autor–plataforma, si el contrato de licencia lo permite.
- **Mercado desatendido:** independientes, clínicos, periodistas, estudiantes sin afiliación, equipos pequeños y lectores en regiones con poco acceso institucional.

### Lo que no es moat

- Usar el código 402: x402 y L402 ya lo hacen a escala o en producción.[^6][^58]
- Aceptar stablecoins: x402, Stripe y Dropp ya soportan pagos cripto o stablecoin.[^29][^11]
- Cobrar por post individual: Coinsnap ya ofrece un paywall pay-per-article sin cuentas.[^27]
- Usar Stellar para micropagos de contenido: SatoshiPay lo demostró años antes.[^30][^31]

## Riesgos críticos

### Derechos y oferta

El MVP técnico puede cobrar $0.50, pero no crea por sí mismo el derecho a entregar un paper cerrado. Muchos acuerdos de publicación transfieren copyright o conceden derechos exclusivos; PaperPay necesita contratos con publishers, sociedades científicas, repositorios autorizados o autores que conserven derechos.[^13][^59]

Un precio uniforme de $0.50 también puede chocar con la economía del publisher. El experimento debe validar si ese precio representa acceso temporal, lectura HTML, una licencia personal, un accepted manuscript, una sección, un dataset o la versión de registro descargable.

### Onboarding y UX

“Sin registro” no significa “sin onboarding”: el usuario todavía necesita wallet, USDC en Stellar y, según el diseño, una trustline o experiencia patrocinada. Circle lista exchanges, dApps y ramps para obtener USDC; las transacciones patrocinadas pueden ocultar la necesidad de mantener XLM.[^38][^15]

La promesa “un clic” debe describirse con precisión: conexión inicial de wallet, revisión de precio, firma, liquidación y recuperación del recurso. En el pitch conviene separar **primer uso** de **compra recurrente**, porque solo la segunda puede acercarse de forma consistente a un clic.

### Protocolo y seguridad

Una intención firmada no debe poder reutilizarse para descargar otros recursos ni sufrir replay. La credencial necesita vincular al menos dominio/audience, DOI o hash del recurso, cantidad, activo, red, destinatario, nonce y expiración. El diseño debe definir reembolsos, pagos duplicados, reorganización/timeout, acceso multidispositivo y qué ocurre si el archivo cambia.

### Regulación y operación

Custodia, conversión fiat, sanciones, KYC/AML, impuestos y reembolsos dependen de jurisdicción y modelo. Un diseño no custodial reduce exposición, pero no elimina obligaciones comerciales o de copyright; para el hackathon debe presentarse como arquitectura, no como afirmación de cumplimiento universal.

## Recomendación de producto

### Wedge inicial

El mejor punto de entrada no es “todo Elsevier a $0.50” porque exige acuerdos imposibles para un MVP. La cuña más creíble es:

1. **Editoriales independientes y sociedades pequeñas** que controlen sus derechos y quieran monetizar lectores no afiliados.
2. **Autores con manuscritos propios o derechos retenidos**, ofreciendo acceso inmediato, anexos, notebooks, datasets o versiones enriquecidas.
3. **Contenido científico premium nativo** —briefs, protocolos, datasets, notebooks ejecutables o capítulos— donde el creador fija directamente el precio.
4. **API/SDK white-label para publishers**, con HTTP 402, USDC Stellar, credencial de acceso y reparto configurable.

### Flujo recomendado

1. El usuario abre un DOI o URL.
2. PaperPay consulta OA y entitlement; si existe copia legal gratuita, la muestra primero.
3. Si no existe, el servidor responde 402 con precio, activo, red, destinatario, licencia y hash del recurso.
4. La wallet firma y envía 0.50 USDC; un patrocinador cubre XLM si aplica.
5. El verificador confirma el pago y emite una credencial corta ligada al recurso.
6. El cliente reintenta la solicitud y recibe HTML/PDF según la licencia.
7. El ledger y el receipt aportan trazabilidad; la identidad civil del lector no es necesaria salvo obligación legal.

### Métricas del hackathon

- Tiempo desde paywall hasta primer byte del contenido.
- Número de interacciones desde 402 hasta acceso.
- Coste total de red como porcentaje de un ticket de $0.50.
- Tasa de éxito de firma y liquidación.
- Prevención de replay y acceso a DOI incorrecto.
- Porcentaje de intentos desviados correctamente a una copia OA gratuita.
- Reparto verificable de ingresos entre titular y plataforma.

## Mensaje para el pitch

> **PaperPay no es otro repositorio DeSci ni otra wallet. Es la capa de acceso legal pay-per-paper: detecta si el artículo ya es gratuito y, cuando no lo es, convierte un paywall de $30–$50 y un checkout de tarjeta en una autorización HTTP 402 de 0.50 USDC, sin cuenta y con liquidación en Stellar.**

Una formulación más prudente para jurados técnicos sería:

> **“x402-style access for licensed scientific content, optimized for Stellar USDC.”**

Esta frase reconoce el estándar emergente y concentra la innovación en la vertical científica. La demo debe enfatizar tres pruebas que los competidores rara vez muestran juntas: **resolución DOI/licencia, pago USDC subdólar y credencial de acceso stateless**.

## Veredicto competitivo

PaperPay tiene un espacio narrativo claro, pero hoy es una **innovación de ensamblaje**: combina primitivas existentes de HTTP 402, stablecoins, Stellar y paywalls con un workflow académico especializado. El proyecto gana si convierte licencias y catálogo en distribución de bajo coste; pierde si se presenta únicamente como una nueva forma de pagar, porque x402, L402, Dropp, Coinsnap y el precedente SatoshiPay ya cubren gran parte de esa capa.

La prioridad posterior al hackathon debe ser validar oferta, no blockchain: obtener cartas de intención de 3–5 publishers pequeños o creadores científicos con derechos, cargar 100–1,000 recursos autorizados y medir si lectores independientes pagan $0.50–$2 por acceso inmediato. Ese experimento comprobaría la hipótesis que ningún protocolo de pago puede resolver por sí solo: **si los titulares aceptan desagregar el paper y si existe suficiente demanda legal a precio micropago**.

---

## References

1. [Introducing the IP-NFT V2 - Molecule.xyz](https://molecule.xyz/blog/introducing-ip-nft-v2) - Inspired by VitaDAO, an increasing number of BioDAOs have formed, looking to fund research in specif...

2. [About | ResearchHub](https://www.researchhub.com/about) - The incentive layer for open science. ResearchCoin (RSC) is an ERC20 token that rewards the work tha...

3. [DeSci Publish - Open-Source Preprint Network](https://www.desci.com/publish) - DeSci Publish is an open-source preprint network that makes it easy and rewarding to publish scienti...

4. [Bitcoin Paywall – The WordPress Bitcoin Paywall for Pay-per-Article ...](https://btcpaywall.com/) - The Coinsnap Bitcoin Paywall is a free WordPress plugin that lets you lock individual posts or selec...

5. [x402](https://x402.org/) - x402 is an open, neutral standard for internet-native payments. It absolves the Internet's original ...

6. [Overview - Coinbase Developer Documentation](https://docs.cdp.coinbase.com/x402/welcome) - x402 turns an API or digital service into a paid resource. A buyer sees the price, pays, and gets ac...

7. [L402: Lightning HTTP 402 Protocol - Builder's Guide](https://docs.lightning.engineering/the-lightning-network/l402) - L402 is the standard for selling and buying digital resources. L402 allows services to charge for AP...

8. [ScienceDirect Journal Subscription Options for librarians and ...](https://www.elsevier.com/products/sciencedirect/journals/subscription-options) - Transactional access If your organization has a ScienceDirect Complete, Standard, Corporate Edition,...

9. [How much does DeepDyve cost? - DeepDyve Knowledge Base](https://help.deepdyve.com/article/13-how-much-does-deepdyve-cost) - DeepDyve offers 2 different options to meet your different needs and budget: LitHub Pro (for Persona...

10. [Access Any Scholarly Article - Article Galaxy - Research Solutions](https://www.researchsolutions.com/article-galaxy) - Instantly rent or purchase peer-reviewed articles, book chapters, and conference papers from all maj...

11. [x402 payments - Stripe Documentation](https://docs.stripe.com/payments/machine/x402) - x402 is a protocol for internet payments. When a client requests a paid resource, your server return...

12. [Authors' Rights in Scholarly Publishing: Know Your Rights](https://libguides.mssm.edu/authorsrights/knowyourrights) - A guide to copyright in scholarly publishing, including negotiating with publishers, journal options...

13. [Author Rights and Scholarly Publishing | Kelvin Smith Library](https://case.edu/library/research-tools/publishing-copyright-and-open-access/author-rights-and-scholarly-publishing) - In scholarly publishing, this is typically done in a “copyright transfer agreement” or a “publicatio...

14. [Fees, Resource Limits, and Metering - Stellar](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering) - Stellar’s ledger close time is constrained to a few seconds, preventing the execution of arbitrarily...

15. [Use USDC as a Native Asset on Stellar - Circle](https://www.circle.com/multi-chain-usdc/stellar) - You can access USDC on Stellar through a free Circle Mint account, via cryptocurrency exchanges and ...

16. [Pricing & Fees - Stripe](https://stripe.com/pricing) - 2.9% + 30¢ per successful transaction for domestic cards … volume or unique business models. Try for...

17. [Fund, Publish & Review Science | ResearchHub Foundation](https://www.researchhub.foundation/) - ResearchCoin (RSC) is the currency of ResearchHub. Get paid for peer reviews and bounties. Fund and ...

18. [Peer Reviewing on ResearchHub](https://blog.researchhub.foundation/peer-reviewing-on-researchhub/) - Be sure to claim rewards on your recent open-access papers, too. On ResearchHub, you can review any ...

19. [Orvium — Make your conference count](https://orvium.io/) - Orvium has enabled us to publish all publications from a large conference with efficiency and profes...

20. [Molecule Partners With VitaDAO and Nevermined Creating First ...](https://www.prnewswire.com/news-releases/molecule-partners-with-vitadao-and-nevermined-creating-first-ever-biopharma-ip-to-nft-transfer-for-longevity-research-301358287.html) - Molecule, a decentralised biopharma marketplace, has developed a novel IP-to-NFT framework with Web3...

21. [VITA-FAST — Revolutionizing Governance in Longevity Research](https://www.vitadao.com/blog/vita-fast-revolutionizing-governance-in-longevity-research) - The VITA-FAST tokens, which allow holders to make decisions on IP licensing, set experiment prioriti...

22. [VitaDAO and Molecule AG partner with Apollo Health Ventures to ...](https://news.lifesciencenewswire.com/newsroom/vitadao-and-molecule-ag-partner-with-apollo-health-ventures-to-build-the-longevity-biotech-web3-ecosystem) - Molecule announces a tripartite partnership with Apollo Health Ventures and VitaDAO to build the lon...

23. [Decentralized Peer Review in Open Science: A Mechanism Proposal](https://arxiv.org/html/2404.18148v1) - publishes the (anonymized) AntsReview enable researchers to install agreements over the review of a ...

24. [Blog | What Web3 Means for Scientific Publishing - DeSci Labs](https://www.desci.com/blog/decentralized-open-access-what-web3-means-for-scientific-publishing) - DeSci Publish focuses on decentralized preprint hosting and community governance, with peer review t...

25. [What is Decentralised Science? DeSci as a New Era in Research](https://www.exp.science/education/decentralised-science-desci-new-era-research) - By decentralising key processes, DeSci aims to make research more open, transparent, and accessible,...

26. [L402: Authentication and Payments for the Lightning-Native Web](https://lightning.engineering/posts/2020-03-30-lsat/) - L402 is a new protocol standard for authentication and paid APIs (using the Internet's preferred cur...

27. [Bitcoin Paywall For WordPress Plugin - Coinsnap](https://coinsnap.io/wp-plugins/wp-bitcoin-paywall/) - Monetize your content instantly with a Bitcoin paywall — lock any post, video, or file and get paid ...

28. [Home - Dropp](https://dropp.cc/) - Dropp is thrilled to announce the launch of Real-Time Payments (RTP) in collaboration with Truist Ba...

29. [Dropp - SPEEDA Edge](https://sp-edge.com/companies/1278826) - Dropp's platform is built on the Hedera Hashgraph network, leveraging its high-speed, low-cost trans...

30. [Stellar Development Foundation Announces Enterprise Fund ...](https://stellar.org/press/stellar-development-foundation-announces-enterprise-fund-investment-in-satoshipay) - SatoshiPay, a platform for connecting the world through instant payments. Their landmark product for...

31. [SatoshiPay Receives €566,000 Investment From Crypto Specialist ...](https://ffnews.com/news/satoshipay-receives-e566000-investment-from-crypto-specialist-and-targets-london-ipo) - ” SatoshiPay has already partnered with technology news site The Register for a micropayments trial ...

32. [SatoshiPay: Connecting the world through instant payments](https://www.satoshipay.io/) - SatoshiPay builds blockchain-powered payment technology. Discover Pendulum and Vortex — instant, low...

33. [Web Monetization - Interledger Foundation](https://interledger.org/tech/web-monetization) - An open web standard that lets sites receive small, automatic payments from visitors as they browse,...

34. [Announcing the Interledger Foundation's Web Monetization ...](https://interledger.org/blog/announcing-interledger-foundations-web-monetization-extension-beta-release) - The Web Monetization beta release makes it easier for users to support websites with real-time micro...

35. [Coil](https://www.coil.com/) - On March 15, 2023, we will discontinue our service. Coil will continue streaming micropayments to an...

36. [Access Protocol Documentation](https://docs.accessprotocol.co/) - Publishers can integrate Access Protocol on their websites and web-based applications to provide exc...

37. [402 Payment Required - HTTP - MDN Web Docs - Mozilla](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/402) - This status code was created to enable digital cash or (micro) payment systems and would indicate th...

38. [Stellar Sponsored Transactions Guide - OpenZeppelin Docs](https://docs.openzeppelin.com/relayer/1.4.x/guides/stellar-sponsored-transactions-guide) - This enables a better user experience where users can pay fees in stablecoins like USDC or other tok...

39. [Purchasing an article on Nature.com - Springer Nature Support](https://support.springernature.com/en/support/solutions/articles/6000272608-purchasing-an-article-on-nature-com) - Under the Abstract details, the “Access Options” that are available for that article will be display...

40. [Simple & Affordable Pricing for Article Rental | DeepDyve](https://www.deepdyve.com/pricing) - Access millions of academic papers and research articles with DeepDyve's affordable pricing. Choose ...

41. [JPASS: JSTOR Personal Access](https://about.jstor.org/products/jpass/) - Monthly. $19.50/month. Best for ongoing research. Read unlimited articles from 2,400+ academic journ...

42. [JPASS: Individual Subscriptions to JSTOR](https://support.jstor.org/hc/en-us/articles/115004675707-JPASS-Individual-Subscriptions-to-JSTOR) - Monthly plans cost $19.50 USD and include 10 PDF downloads per month. Annual plans cost $199.00 USD ...

43. [Article Galaxy - Seamless Access to Scholarly Literature](https://www.articlegalaxy.com/) - Article Galaxy brings subscribed, open-access, and on-demand content together in a single search, so...

44. [Article Galaxy Scholar - Library, University of York](https://www.york.ac.uk/library/research-creativity/ags/) - Article Galaxy Scholar is paid for at a Faculty level, and costs £30 for every article supplied. As ...

45. [Document Delivery with RightFind - Get Content on Demand | CCC](https://www.copyright.com/solutions-document-delivery-with-rightfind-business/account-options/) - For individual buyers who want to purchase a single document. CCC Marketplace also enables customers...

46. [Document Delivery with RightFind - Copyright Clearance Center](https://www.copyright.com/solutions-document-delivery-with-rightfind-business/) - Search RightFind's comprehensive database of scientific, technical and medical (STM) content that in...

47. [GetFTR and SeamlessAccess – How can these services help speed ...](https://www.getfulltextresearch.com/getftr-and-seamlessaccess-how-can-these-services-help-speed-the-researcher-journey) - GetFTR can build on top of SeamlessAccess to more easily identify what institution should be checked...

48. [GetFTR Explained: Real-Time Entitlement Check - CASRAI](https://casrai.org/guides/getftr-explained-entitlement-checking) - GetFTR checks in real time whether a reader is entitled to a specific article at the point of discov...

49. [Unpaywall: An open database of 20 million free scholarly articles](https://unpaywall.org/) - An open database of 57,028,430 free scholarly articles. We harvest Open Access content from over 50,...

50. [FAQ - Unpaywall](https://unpaywall.org/faq) - Is Unpaywall legal? Yes! We harvest content from legal sources including repositories run by univers...

51. [CORE: A Global Aggregation Service for Open Access Papers - Nature](https://www.nature.com/articles/s41597-023-02208-w) - As of February 2023, CORE provides access to over 291 million metadata records and 32.8 million full...

52. [Open access – Works | OpenAlex Help Center](https://help.openalex.org/data/works/open-access/) - OpenAlex uses a broad one: a work is OA if there's a URL where you can read its full text without pa...

53. [What Should You Do When a Research Paper Is Behind a Paywall?](https://manuelgarcia.info/guides/research/guide/research-paper-behind-paywall) - Can't access a research paper behind a paywall? Learn how to check library access, find legal open c...

54. [Searching Around Paywalls - Physics](https://guides.lib.utexas.edu/c.php?g=1476928&p=11017204) - Can't find an article in UTL's databases? Try out Interlibrary Loan (ILL). Request a book, article, ...

55. [Judgment Against Sci-Hub is a Win for Authors and Publishers](https://cip2.gmu.edu/2017/06/27/judgment-against-sci-hub-is-a-win-for-authors-and-publishers/) - Along with the maximum damages permitted by law, the judgment makes permanent a 2015 preliminary inj...

56. [[PDF] CS(COMM) 572/2020 - High Court of Delhi](https://delhihighcourt.nic.in/app/showFile/1755790177_423f44b569863f9b_589_5722020.pdf/2025) - 10.4 It is stated that Sci-Hub has been found to infringe copyright in multiple jurisdictions by usi...

57. [USDC contract addresses - Circle Docs](https://developers.circle.com/stablecoins/usdc-contract-addresses) - USDC is a dollar-backed stablecoin that runs on multiple blockchains. USDC tokens are controlled by ...

58. [L402 — Pay for APIs with Lightning. Authenticate with the receipt.](https://l402.tech/) - L402 is a standard to support the authentication and payment of services over the internet. Pay for ...

59. [Publisher Contracts - Scholarly Publishing - Guides at Johns ...](https://guides.library.jhu.edu/scholarly_publishing/contracts) - In situations where copyright has been transferred or exclusively licensed to the publisher, this se...

