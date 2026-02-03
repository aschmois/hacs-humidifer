import './card';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

const windowWithCards = window as unknown as Window & {
  customCards: unknown[];
};
windowWithCards.customCards = windowWithCards.customCards || [];
windowWithCards.customCards.push({
  type: 'humidifier-control-card',
  name: 'Humidifier Control Card',
  description: 'Control humidifier with override timer and automatic mist adjustment',
});

console.info(
  `%c  HUMIDIFIER-CONTROL-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);
