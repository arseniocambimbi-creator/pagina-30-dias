/**
 * Mensagens do Fluxo de Vendas WhatsApp
 * Método dos 30 Dias Sem Desculpas — Angola
 *
 * Cada mensagem é uma função que recebe o nome do lead
 * e devolve a string formatada para envio.
 */

const AGENT = process.env.AGENT_NAME || 'equipa do Método 30 Dias';

const ACCESS_LINK   = process.env.ACCESS_LINK    || 'https://pay.kursinha.com/c/6a2336a0d0cbc8fc6e870bb2';
const LINK_PLANILHA = process.env.LINK_PLANILHA  || ACCESS_LINK;
const LINK_KIXIKILA = process.env.LINK_KIXIKILA  || ACCESS_LINK;
const LINK_FRASES   = process.env.LINK_FRASES    || ACCESS_LINK;
const LINK_GRUPO    = process.env.LINK_GRUPO      || ACCESS_LINK;

// ─── FASE 1 — PRIMEIRO CONTACTO ─────────────────────────────────────────────

export const M1 = (name) =>
`Olá${name ? ' ' + name : ''}! 👋

Aqui é ${AGENT}.

Vi que tens interesse em finalmente criar o hábito de poupar. 💰

Antes de tudo — posso te fazer uma pergunta rápida?`;

export const M1B = (name) =>
`Olá${name ? ' ' + name : ''}! 😊

Vejo que ainda não tiveste tempo de responder.

Fico à disposição sempre que quiseres.

Só quero garantir que tens toda a informação antes de decidir. 🙌`;

// ─── FASE 2 — QUALIFICAÇÃO ───────────────────────────────────────────────────

export const M2 = (name) =>
`${name ? name + ', diz' : 'Diz'}-me uma coisa:

Qual destas situações te identifica mais? 👇

1️⃣ O salário some antes do fim do mês e não sei para onde vai

2️⃣ Quero poupar mas a família e as despesas não deixam

3️⃣ Já tentei várias vezes mas nunca consigo manter

Responde só com o número. 😊`;

// ─── FASE 3 — IDENTIFICAÇÃO DA DOR ──────────────────────────────────────────

export const M3A = (_name) =>
`Ah, conheço bem essa sensação... 😔

Recebes no dia 1 e no dia 15 já estás a perguntar para onde foi.

Sabe o que é mais frustrante nisso?

Não é que estejas a fazer nada de errado.

É que nunca ninguém te ensinou o sistema certo para gerir o dinheiro na nossa realidade aqui em Angola.

Posso mostrar-te o que está a resolver exactamente isso? 👇`;

export const M3B = (_name) =>
`Isso é muito comum em Angola... 🙏

A família pede, as despesas sobem, os combustíveis aumentaram — e no fim do mês não sobra nada para ti.

Mas vou ser directo contigo:

O problema não é a família. É não ter um sistema que proteja o teu dinheiro ANTES de chegarem os pedidos.

Quer que te explique como funciona? 👇`;

export const M3C = (_name) =>
`Olha, o facto de já teres tentado diz muito de ti. 💪

O problema das outras tentativas? Foram baseadas em força de vontade.

E força de vontade acaba. Método não.

O que vou mostrar-te é diferente — é um plano dia a dia, com acções concretas para cada dia dos 30 dias.

Não precisas de depender da motivação. Só de seguir o passo.

Posso mostrar-te? 👇`;

export const M3D = (_name) =>
`Entendo! 😊

Seja qual for a tua situação com o dinheiro, tens algo em comum com quem já usou este método:

A vontade de mudar.

Deixa-me mostrar-te rapidamente o que estamos a fazer diferente para os angolanos que querem finalmente poupar de verdade.

Posso? 👇`;

// ─── FASE 3 — APRESENTAÇÃO DA SOLUÇÃO ───────────────────────────────────────

export const M4 = (_name) =>
`O Método dos 30 Dias Sem Desculpas foi criado especificamente para a realidade angolana. 🇦🇴

Não é teoria importada do Brasil. É um sistema com:

✅ Valores reais em kwanza
✅ Estratégias para obrigações familiares
✅ O kixikila como ferramenta de poupança
✅ Protecção contra a inflação (28% em 2024)
✅ Casos reais de Luanda, Benguela e Huambo

Em 30 dias tens um plano claro — dia a dia, sem precisar de perceber de finanças.

Posso mostrar-te o que está incluído? 👇`;

export const M4B = (_name) =>
`Sem problema! 😊

Podes fazer-me uma pergunta? O que te está a gerar dúvida agora?

Preferes:

1️⃣ Saber mais sobre o método
2️⃣ Falar sobre o preço
3️⃣ Saber se funciona para a minha situação

Responde com o número 👆`;

// ─── FASE 4 — OFERTA E PREÇO ─────────────────────────────────────────────────

export const M5 = (_name) =>
`Aqui está tudo o que recebes hoje: 👇

📘 EBOOK COMPLETO
O Método dos 30 Dias Sem Desculpas
(Plano dia a dia — 14 capítulos)
Valor: 3.500 AOA

🎁 BÓNUS 1
Planilha de Orçamento Angolana
(Pronta a usar, categorias Angola)
Valor: 3.000 AOA

🎁 BÓNUS 2
Guia do Kixikila Inteligente
(Como usar o kixikila do bairro para poupar com segurança)
Valor: 2.000 AOA

🎁 BÓNUS 3
30 Frases Para Dizer Não à Família
(Scripts adaptados para Angola)
Valor: 1.500 AOA

──────────────────
Valor total: ~~10.000 AOA~~
HOJE: apenas 2.500 AOA 🔥

Com garantia de 7 dias — se não ficares satisfeito, devolvo tudo.

O que achas? 😊`;

export const M5B = (name) =>
`${name ? name + ', só' : 'Só'} para garantir que viste a mensagem anterior 😊

A oferta de 2.500 AOA com todos os 4 itens é de lançamento — não vai ficar assim para sempre.

Tens alguma dúvida que possa responder antes de decidires? 🙏`;

// ─── FASE 5 — QUEBRA DE OBJECÇÕES ───────────────────────────────────────────

export const M6 = (name) =>
`Entendo a tua preocupação${name ? ', ' + name : ''}. 🙏

Deixa-me ajudar-te a ver de outra forma:

2.500 AOA é quanto gastas numa semana em recargas de dados.

Ou numa refeição fora.

Agora imagina que este método te ajuda a poupar 15.000 AOA só no primeiro mês.

Isso é um retorno de 6x em 30 dias. 📈

E se não funcionar — tens 7 dias para pedir o dinheiro de volta.

Ou seja, o risco é zero. 😊

Faz sentido para ti?`;

export const M6B = (name) =>
`${name ? name + ', vou' : 'Vou'} ser honesto contigo:

Não consigo baixar o preço — já está no mínimo de lançamento.

Mas posso garantir-te uma coisa:

O Carlos de Benguela ganhava 120.000 AOA e achava impossível poupar.

Em 6 meses com este método tinha 60.000 AOA de reserva.

O método custou-lhe 2.500 AOA. A reserva que criou vale 60.000.

Queres seguir o mesmo caminho? 💪`;

export const M7 = (name) =>
`Claro${name ? ', ' + name : ''}! Faz todo o sentido ponderar bem. 😊

Só quero partilhar uma coisa:

Cada mês que passa sem método é mais um mês de salário que vai embora sem destino.

Se esperares mais 3 meses — já perdeste potencialmente 45.000 a 60.000 AOA em poupanças.

Mais do que 15x o preço do método.

Além disso — tens 7 dias de garantia. Se não ficares satisfeito, devolvo o dinheiro na totalidade.

O que te está a impedir de começar ainda hoje? 🙏`;

export const M8 = (name) =>
`${name ? name + ', isso' : 'Isso'} é muito real em Angola. E entendo completamente. 🙏

Mas deixa-me dizer uma coisa importante:

Este método tem um capítulo inteiro sobre obrigações familiares.

A solução não é ignorar a família — é definir um valor fixo mensal que toda a gente passa a respeitar.

A Esperança do Kinaxixi pensava exactamente como tu.

Hoje contribui com valor fixo — e ainda assim poupou 80.000 AOA em 8 meses.

A família ficou bem. As finanças dela também.

Queres saber como ela fez? 👇`;

export const M9 = (_name) =>
`Tens razão — a inflação está a 28% em Angola. É real. 📊

Mas sabes o que destrói mais do que a inflação?

Não poupar nada.

Porque 0 AOA poupado com inflação ainda é 0 AOA.

No método aprendes a proteger o teu kwanza com:

✅ Títulos do Tesouro Angolanos
✅ Dólar como reserva de valor
✅ Kixikila organizado

A inflação é razão para poupar de forma inteligente — não para não poupar.

Faz sentido? 😊`;

export const M10 = (name) =>
`${name ? name + ', isso' : 'Isso'} mostra que tens vontade de mudar — não fraqueza. 💪

Sabes qual foi o problema das outras tentativas?

Foram baseadas em força de vontade. E a força de vontade acaba.

Este método é diferente porque:

📅 É um plano dia a dia concreto — não depende de motivação

🎯 Tem acções específicas para cada dia dos 30 dias

🤝 Inclui acesso à comunidade "Poupadores de Angola" para não estares sozinho no processo

E se mesmo assim não funcionar — tens 7 dias para pedir o reembolso.

Queres tentar esta vez com um sistema real? 💚`;

// ─── FASE 6 — PAGAMENTO ──────────────────────────────────────────────────────

export const M11 = (name) =>
`Óptimo${name ? ', ' + name : ''}! 🎉

Para garantires o teu acesso, é muito simples:

💳 MULTICAIXA EXPRESS:
Número: 946 186 353
Valor: 2.500 AOA

🏦 TRANSFERÊNCIA BANCÁRIA:
Titular: ARSÉNIO MIGUEL JOÃO CAMBIMBI

BFA: 0006 0000 4325 8608 3015 5
BAI: 0040 0000 2015 9016 1015 5
Atlântico: 0055 0000 5266 5520 1018 5

⚠️ Paga do mesmo banco da tua conta para evitar transtornos.

Após o pagamento, envia-me o comprovativo aqui. 📸

Assim que confirmar, recebes o acesso imediatamente. ⚡`;

export const M11B = (name) =>
`${name ? name + ', tudo' : 'Tudo'} bem? 😊

Tens alguma dificuldade com o pagamento?

Se precisares de ajuda estou aqui para orientar. 🙏`;

export const M11C = (name) =>
`Sem problema${name ? ', ' + name : ''}!

Qual o método de pagamento que tens disponível agora?

1️⃣ Multicaixa Express
2️⃣ Transferência bancária (BFA, BAI ou Atlântico)
3️⃣ Outro método

Diz-me e eu ajudo-te a finalizar. 😊`;

// ─── FASE 7 — PÓS-COMPRA ────────────────────────────────────────────────────

export const M12 = (name) =>
`${name ? name + '! ' : ''}Pagamento confirmado! 🎉🎉

Bem-vindo(a) ao Método 30 Dias! 💚

Aqui está o teu acesso completo:

📘 EBOOK: ${ACCESS_LINK}
📊 PLANILHA: ${LINK_PLANILHA}
📖 GUIA KIXIKILA: ${LINK_KIXIKILA}
💬 30 FRASES FAMÍLIA: ${LINK_FRASES}
👥 GRUPO WHATSAPP: ${LINK_GRUPO}

Começa pelo Capítulo 1 — a Radiografia Financeira.

É o passo mais importante e vai surpreender-te. 💪

Qualquer dúvida, estou aqui! 🙌`;

// ─── FASE 8 — FOLLOW-UP (pós-compra) ────────────────────────────────────────

export const M13 = (name) =>
`Olá${name ? ' ' + name : ''}! 👋

Já conseguiste aceder ao método?

Já fizeste o Dia 1 — a Radiografia Financeira?

É o passo mais revelador de todos. Muita gente fica chocada com o que descobre sobre os próprios gastos.

Como correu? 😊`;

export const M14 = (name) =>
`${name ? name + ', já' : 'Já'} estás no Dia 3! 🏆

Dica extra que não está no guia:

Usa o verso de um envelope para anotar os gastos do dia.

Tecnologia simples — resultado alto. Funciona muito bem aqui em Angola. 💡

Já definiste o teu "número" — o valor que vais poupar todo o mês?

Partilha comigo! 🙌`;

export const M15 = (name) =>
`${name ? name + '! ' : ''}Uma semana completa! 🎊

Como te estás a sentir em relação ao teu dinheiro?

Já tens mais clareza sobre para onde vai o salário?

Conta-me como está a correr. Fico feliz em saber! 😊`;

export const M16 = (name) =>
`${name ? name + ', já' : 'Já'} estás a meio do caminho! 💪

Sabes o que é interessante?

Quem chega ao Dia 14 normalmente completa os 30 dias.

Já estás na fase de crescimento — onde o método começa a falar sobre kixikila e Títulos do Tesouro.

Já chegaste a essa parte? 📈

E quanto poupaste até agora? Partilha — quero celebrar contigo! 🎉`;

export const M17 = (name) =>
`${name ? name + '! ' : ''}20 dias! Isso é incrível! 🏆

Sabes que menos de 20% das pessoas chegam ao Dia 20 de qualquer desafio?

Tu chegaste.

Isso diz tudo sobre o teu compromisso.

Quanto poupaste até hoje? Calcula o valor e envia-me — quero ver o progresso! 💰

Nos próximos 10 dias foca-te em:
✅ Automatizar o que puderes
✅ Planear o Mês 2
✅ Definir o próximo objectivo

Estou aqui se precisares! 💚`;

// ─── FASE 9 — UPSELL ────────────────────────────────────────────────────────

export const M18 = (name) =>
`${name ? name + ', uma' : 'Uma'} coisa rápida. 😊

Como vês que o método está a funcionar para ti —

Quero apresentar-te uma oportunidade especial, só para quem já é cliente:

🚀 PROGRAMA 90 DIAS — INDEPENDÊNCIA FINANCEIRA ANGOLA

O que está incluído:
✅ 3 meses de conteúdo progressivo
✅ Sessões mensais em grupo (online)
✅ Grupo VIP de Poupadores Angola
✅ Planilhas avançadas (AOA e USD)
✅ Guia: negócio com 50.000 AOA

Normalmente: 15.000 AOA
Para clientes actuais: 9.500 AOA

Esta oferta é apenas para ti e expira em 48 horas. ⏰

Tens interesse em saber mais? 👇`;

// ─── FASE 10 — REACTIVAÇÃO ───────────────────────────────────────────────────

export const M19 = (name) =>
`Olá${name ? ' ' + name : ''}! 😊

Queria só verificar se tinhas alguma dúvida sobre o Método 30 Dias que eu pudesse responder.

Muitas vezes a dúvida é pequena e eu consigo resolver em segundos. 😄

O que te está a travar? 🙏`;

export const M20 = (name) =>
`${name ? name + ', boa' : 'Boa'} semana! 👋

Passaram alguns dias desde que mostraste interesse no método.

Só quero partilhar um resultado real de quem decidiu avançar:

"Ganhava 120.000 AOA e achava impossível poupar. Em 6 meses tinha 60.000 de reserva."
— Carlos, Benguela ⭐⭐⭐⭐⭐

A oferta de 2.500 AOA ainda está disponível com todos os bónus.

Estás pronto para dar este passo? 💚`;

export const M21 = (name) =>
`${name ? name + ', última' : 'Última'} mensagem da minha parte. Prometo. 😊

Só quero deixar um pensamento:

Cada mês sem método é um mês de salário que desaparece.

Nos últimos dias desde o teu interesse, alguém com o mesmo salário que tu já poupou os primeiros 5.000 AOA.

Se o momento ainda não for este, sem problema.

Mas se decidires avançar, continuo aqui. 💚

2.500 AOA · Garantia 7 dias · Acesso imediato`;

// ─── SITUAÇÕES ESPECIAIS ─────────────────────────────────────────────────────

export const DESCONTO = (name) =>
`${name ? name + ', entendo' : 'Entendo'} o pedido. 😊

Vou ser honesto contigo:

O preço de 2.500 AOA é já o preço mínimo de lançamento.

É literalmente o preço mais baixo que este método vai ter.

Quando o lançamento terminar, sobe para 4.500 AOA.

O que posso garantir-te é:

✅ Acesso imediato
✅ Todos os 3 bónus incluídos
✅ Garantia de 7 dias sem risco

Mais do que isto honestamente não consigo fazer. 🙏

Avançamos?`;

export const SEM_DINHEIRO = (name) =>
`${name ? name + ', obrigado' : 'Obrigado'} pela honestidade. 🙏

Entendo completamente.

Quando a situação melhorar, o método continua aqui para ti.

Só uma coisa antes de terminar:

O método existe exactamente para ajudar quem está nesta situação.

Às vezes o investimento de 2.500 AOA hoje é o que cria os 60.000 AOA de amanhã.

Se quiseres, posso enviar-te um conteúdo gratuito sobre os primeiros passos para organizar o dinheiro ainda esta semana?

Sem compromisso. 😊`;

export const AUTENTICIDADE = (name) =>
`${name ? name + ', é' : 'É'} completamente válido teres essa preocupação. 😊

Deixa-me ser transparente:

✅ O método tem garantia de 7 dias — se não ficares satisfeito, devolves o dinheiro na totalidade

✅ O pagamento é via Multicaixa Express — o método de pagamento mais seguro e familiar de Angola

✅ O acesso é imediato após pagamento — não precisas de esperar dias

✅ Tens o nosso WhatsApp — podes contactar-nos a qualquer hora

Que outra informação posso dar-te para estares mais tranquilo? 🙏`;

export const NURTURING_LINK = (_name) =>
`Aqui tens um conteúdo gratuito para começares ainda hoje:

📖 "3 passos para parar de perder o salário no início do mês"

${ACCESS_LINK}

Sem compromisso. Só partilha porque acredito que pode ajudar-te. 💚`;
