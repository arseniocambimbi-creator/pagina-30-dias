/**
 * Motor de Fluxo de Vendas WhatsApp
 * Método dos 30 Dias Sem Desculpas — Angola
 *
 * Função principal: processMessage(lead, messageText, isImage)
 *   → { nextStep, messages: string[], nextData: object }
 *
 * Estados possíveis (lead.step):
 *   NEW, M1_SENT, M2_SENT, M3_SENT, M4_SENT, M4B_SENT,
 *   M5_SENT, M6_SENT, M6B_SENT, M7_SENT, M8_SENT, M9_SENT, M10_SENT,
 *   M11_SENT, PURCHASED,
 *   FOLLOWUP_D1, FOLLOWUP_D3, FOLLOWUP_D7, FOLLOWUP_D14, FOLLOWUP_D20,
 *   UPSELL_SENT, NURTURING, REACT_M19, REACT_M20, CLOSED
 */

import * as MSG from './messages.js';

// ─── HELPERS DE DETECÇÃO DE INTENÇÃO ────────────────────────────────────────

const POSITIVE = ['sim', 'quero', 'como pago', 'pagar', 'comprar', 'aceito',
  'ok', 'vou', 'bora', 'mostre', 'mostra', 'claro', 'pode', 'continua',
  'conta', 'diz', 'quero saber', 'avancemos', 'avança', 'avança', 'feito',
  'interessa', 'interessado', 'quero sim', 'boa', 'bacano'];

const NEGATIVE = ['não', 'nao', 'nope', 'nunca', 'talvez', 'agora não',
  'mais tarde', 'outro dia', 'obrigado', 'obg', 'vlw', 'valeu'];

const PRICE_OBJ = ['caro', 'muito', 'preço', 'barato', 'desconto', 'reduz',
  'cara', 'alto', 'elevado', 'não tenho', 'pouco dinheiro'];

const TIME_OBJ = ['pensar', 'depois', 'amanhã', 'próximo', 'semana', 'mês',
  'mais tarde', 'vou ver', 'deixa pensar', 'ponderar'];

const FAMILY_OBJ = ['família', 'familia', 'filhos', 'dependentes', 'sustentar',
  'criança', 'crianças', 'esposa', 'marido', 'pais'];

const INFLATION_OBJ = ['inflação', 'inflacao', 'kwanza', 'desvaloriza',
  'sobe tudo', 'preços sobem', 'economia'];

const TRIED_OBJ = ['tentei', 'já tentei', 'nao funcionou', 'não funcionou',
  'antes tentei', 'desiludido', 'desisti'];

const PAYMENT_SENT = ['paguei', 'feito', 'enviado', 'comprovativo', 'transferi',
  'pago', 'já paguei', 'já transferi', 'fiz o pagamento', 'fiz', 'já fiz'];

const DISCOUNT_WORDS = ['desconto', 'abaixo', 'baixar', 'reduz', 'metade',
  'menos', 'barato'];

const NO_MONEY_WORDS = ['não tenho dinheiro', 'sem dinheiro', 'dinheiro não',
  'nao tenho', 'não tenho', 'broke', 'falido'];

const AUTH_WORDS = ['verdade', 'confiar', 'golpe', 'burla', 'fraude',
  'autêntico', 'autentico', 'como sei', 'confirme', 'prova', 'garantia',
  'seguro', 'real', 'funciona mesmo'];

function contains(text, words) {
  return words.some(w => text.includes(w));
}

function isPositive(text) {
  return contains(text, POSITIVE);
}

function isNegative(text) {
  return contains(text, NEGATIVE);
}

// ─── MOTOR PRINCIPAL ─────────────────────────────────────────────────────────

/**
 * Processa uma mensagem recebida e determina a próxima acção.
 *
 * @param {object}  lead          - Estado actual do lead {phone, name, step, data}
 * @param {string}  messageText   - Texto da mensagem (normalizado para lowercase)
 * @param {boolean} isImage       - Se é uma imagem (ex: comprovativo)
 * @returns {{ nextStep: string, messages: string[], nextData: object }}
 */
export function processMessage(lead, messageText, isImage = false) {
  const name     = lead.name || '';
  const step     = lead.step || 'NEW';
  const data     = lead.data || {};
  const txt      = messageText.toLowerCase().trim();

  // ── Situações especiais (detectadas em qualquer fase a partir de M4_SENT) ──
  if (['M4_SENT','M4B_SENT','M5_SENT','M6_SENT','M6B_SENT',
       'M7_SENT','M8_SENT','M9_SENT','M10_SENT',
       'M11_SENT','REACT_M19','REACT_M20','NURTURING'].includes(step)) {

    if (contains(txt, NO_MONEY_WORDS)) {
      return { nextStep: 'NURTURING', messages: [MSG.SEM_DINHEIRO(name)], nextData: data };
    }
    if (contains(txt, AUTH_WORDS)) {
      return { nextStep: step, messages: [MSG.AUTENTICIDADE(name)], nextData: data };
    }
    if (contains(txt, DISCOUNT_WORDS) && !['M6_SENT','M6B_SENT'].includes(step)) {
      return { nextStep: 'M6_SENT', messages: [MSG.DESCONTO(name)], nextData: data };
    }
  }

  // ── Máquina de estados ────────────────────────────────────────────────────
  switch (step) {

    // Lead novo — enviar saudação
    case 'NEW':
      return {
        nextStep:  'M1_SENT',
        messages:  [MSG.M1(name)],
        nextData:  data,
      };

    // M1 enviado — qualquer resposta avança para qualificação
    case 'M1_SENT':
      return {
        nextStep:  'M2_SENT',
        messages:  [MSG.M2(name)],
        nextData:  data,
      };

    // M2 — qualificação (1 / 2 / 3 / outro)
    case 'M2_SENT': {
      let painType = 'D';
      let painMsg  = MSG.M3D(name);
      if (txt === '1' || txt.startsWith('1')) { painType = 'A'; painMsg = MSG.M3A(name); }
      else if (txt === '2' || txt.startsWith('2')) { painType = 'B'; painMsg = MSG.M3B(name); }
      else if (txt === '3' || txt.startsWith('3')) { painType = 'C'; painMsg = MSG.M3C(name); }

      return {
        nextStep:  'M3_SENT',
        messages:  [painMsg],
        nextData:  { ...data, pain_type: painType },
      };
    }

    // M3 enviado — qualquer resposta positiva → M4
    case 'M3_SENT':
      return {
        nextStep:  'M4_SENT',
        messages:  [MSG.M4(name)],
        nextData:  data,
      };

    // M4 — apresentação do método
    case 'M4_SENT':
      if (isPositive(txt)) {
        return { nextStep: 'M5_SENT', messages: [MSG.M5(name)], nextData: data };
      }
      if (isNegative(txt)) {
        return { nextStep: 'NURTURING', messages: [MSG.M4B(name)], nextData: data };
      }
      // Dúvida ou pergunta
      return { nextStep: 'M4B_SENT', messages: [MSG.M4B(name)], nextData: data };

    // M4B — tratamento de hesitação (1 / 2 / 3)
    case 'M4B_SENT':
      if (txt === '1' || txt.startsWith('1')) {
        return { nextStep: 'M4_SENT', messages: [MSG.M4(name)], nextData: data };
      }
      if (txt === '2' || txt.startsWith('2')) {
        return { nextStep: 'M5_SENT', messages: [MSG.M5(name)], nextData: data };
      }
      // "3" ou outra coisa → re-qualificar
      return { nextStep: 'M3_SENT', messages: [MSG.M3D(name)], nextData: data };

    // M5 — oferta principal
    case 'M5_SENT': {
      if (isPositive(txt) || contains(txt, ['como pago', 'pagamento', 'referência'])) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      if (contains(txt, PRICE_OBJ)) {
        return { nextStep: 'M6_SENT', messages: [MSG.M6(name)], nextData: { ...data, objections: [...(data.objections||[]), 'price'] } };
      }
      if (contains(txt, TIME_OBJ)) {
        return { nextStep: 'M7_SENT', messages: [MSG.M7(name)], nextData: { ...data, objections: [...(data.objections||[]), 'time'] } };
      }
      if (contains(txt, FAMILY_OBJ)) {
        return { nextStep: 'M8_SENT', messages: [MSG.M8(name)], nextData: { ...data, objections: [...(data.objections||[]), 'family'] } };
      }
      if (contains(txt, INFLATION_OBJ)) {
        return { nextStep: 'M9_SENT', messages: [MSG.M9(name)], nextData: { ...data, objections: [...(data.objections||[]), 'inflation'] } };
      }
      if (contains(txt, TRIED_OBJ)) {
        return { nextStep: 'M10_SENT', messages: [MSG.M10(name)], nextData: { ...data, objections: [...(data.objections||[]), 'tried'] } };
      }
      // Resposta ambígua → follow-up suave
      return { nextStep: 'M5_SENT', messages: [MSG.M5B(name)], nextData: data };
    }

    // M6 — objecção preço
    case 'M6_SENT':
      if (isPositive(txt) || contains(txt, ['faz sentido', 'tá bem', 'ta bem', 'entendo'])) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      return { nextStep: 'M6B_SENT', messages: [MSG.M6B(name)], nextData: data };

    // M6B — reforço de valor
    case 'M6B_SENT':
      if (isPositive(txt)) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      return { nextStep: 'NURTURING', messages: [MSG.SEM_DINHEIRO(name)], nextData: data };

    // M7 — "vou pensar"
    case 'M7_SENT':
      if (isPositive(txt) || contains(txt, ['pronto', 'ok', 'avança'])) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      return { nextStep: 'NURTURING', messages: [MSG.M21(name)], nextData: data };

    // M8 — objecção família
    case 'M8_SENT':
      if (isPositive(txt)) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      return { nextStep: 'M5_SENT', messages: [MSG.M5(name)], nextData: data };

    // M9 — objecção inflação
    case 'M9_SENT':
      if (isPositive(txt) || contains(txt, ['faz sentido', 'entendo', 'concordo'])) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      return { nextStep: 'M5_SENT', messages: [MSG.M5(name)], nextData: data };

    // M10 — "já tentei"
    case 'M10_SENT':
      if (isPositive(txt)) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      return { nextStep: 'NURTURING', messages: [MSG.M21(name)], nextData: data };

    // M11 — instruções de pagamento (aguardar comprovativo)
    case 'M11_SENT':
      if (isImage) {
        // Imagem recebida → comprovativo de pagamento
        return { nextStep: 'PURCHASED', messages: [MSG.M12(name)], nextData: { ...data, purchase_date: new Date().toISOString() } };
      }
      if (contains(txt, PAYMENT_SENT)) {
        return { nextStep: 'PURCHASED', messages: [MSG.M12(name)], nextData: { ...data, purchase_date: new Date().toISOString() } };
      }
      if (contains(txt, ['método', 'forma', 'como', 'posso'])) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11C(name)], nextData: data };
      }
      // Outra coisa → follow-up amigável
      return { nextStep: 'M11_SENT', messages: [MSG.M11B(name)], nextData: data };

    // PURCHASED — cliente confirmado, responder ao follow-up
    case 'PURCHASED':
    case 'FOLLOWUP_D1':
    case 'FOLLOWUP_D3':
    case 'FOLLOWUP_D7':
    case 'FOLLOWUP_D14':
    case 'FOLLOWUP_D20':
      // Respostas de clientes activos — resposta de encorajamento
      return {
        nextStep: step,
        messages: [`Obrigado por partilhares! 💚\n\nContinua assim — estás no caminho certo. Se tiveres alguma dúvida, é só falar!`],
        nextData: data,
      };

    // UPSELL — resposta ao M18
    case 'UPSELL_SENT':
      if (isPositive(txt)) {
        return { nextStep: 'M11_SENT', messages: [
          `Óptimo${name ? ', ' + name : ''}! 🚀\n\nO Programa 90 Dias está a 9.500 AOA para clientes actuais.\n\nUsa os mesmos dados de pagamento:`,
          MSG.M11(name).replace('2.500 AOA', '9.500 AOA'),
        ], nextData: data };
      }
      return { nextStep: 'PURCHASED', messages: [`Sem problema! 😊 Qualquer coisa que precisares, estou aqui. 💚`], nextData: data };

    // Reactivação M19
    case 'REACT_M19':
      if (isPositive(txt) || !isNegative(txt)) {
        return { nextStep: 'M5_SENT', messages: [MSG.M5(name)], nextData: data };
      }
      return { nextStep: 'REACT_M20', messages: [MSG.M20(name)], nextData: data };

    // Reactivação M20
    case 'REACT_M20':
      if (isPositive(txt)) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      return { nextStep: 'REACT_M21', messages: [MSG.M21(name)], nextData: data };

    // Reactivação M21 (última mensagem)
    case 'REACT_M21':
      if (isPositive(txt)) {
        return { nextStep: 'M11_SENT', messages: [MSG.M11(name)], nextData: data };
      }
      return { nextStep: 'CLOSED', messages: [], nextData: data };

    // NURTURING — lead não comprou, manter engajamento
    case 'NURTURING':
      if (isPositive(txt) || contains(txt, ['quero', 'mudei', 'agora sim', 'avança'])) {
        return { nextStep: 'M5_SENT', messages: [MSG.M5(name)], nextData: data };
      }
      // Oferecer conteúdo gratuito
      return { nextStep: 'NURTURING', messages: [MSG.NURTURING_LINK(name)], nextData: data };

    // CLOSED / fallback
    case 'CLOSED':
    default:
      if (isPositive(txt) || txt.length > 2) {
        // Lead voltou após fecho — reiniciar com M19
        return { nextStep: 'REACT_M19', messages: [MSG.M19(name)], nextData: data };
      }
      return { nextStep: 'CLOSED', messages: [], nextData: data };
  }
}
