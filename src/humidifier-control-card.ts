/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  LovelaceCardEditor,
} from 'custom-card-helpers';

import type { HumidifierControlCardConfig } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  HUMIDIFIER-CONTROL-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'custom:humidifier-control-card',
  name: 'Humidifier Control Card',
  description: 'Control humidifier with override timer and automatic mist adjustment',
});

@customElement('humidifier-control-card')
export class HumidifierControlCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('humidifier-control-card-editor');
  }

  public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
    const entities = Object.keys(hass.states);
    return {
      type: 'custom:humidifier-control-card',
      humidity_sensor: entities.find(e => e.startsWith('sensor.') && e.includes('humidity')),
      target_humidity: entities.find(e => e.startsWith('input_number.')),
      mist_level: entities.find(e => e.startsWith('number.')),
      water_sensor: entities.find(e => e.startsWith('binary_sensor.') && e.includes('water')),
      override_timer: entities.find(e => e.startsWith('input_select.')),
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: HumidifierControlCardConfig;

  public setConfig(config: HumidifierControlCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (!config.humidity_sensor) {
      throw new Error(localize('common.missing_entity') + ': humidity_sensor');
    }
    if (!config.target_humidity) {
      throw new Error(localize('common.missing_entity') + ': target_humidity');
    }
    if (!config.mist_level) {
      throw new Error(localize('common.missing_entity') + ': mist_level');
    }
    if (!config.water_sensor) {
      throw new Error(localize('common.missing_entity') + ': water_sensor');
    }
    if (!config.override_timer) {
      throw new Error(localize('common.missing_entity') + ': override_timer');
    }

    this.config = {
      name: 'Humidifier',
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  public getCardSize(): number {
    return 4;
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.config) {
      return html``;
    }

    const humidityState = this.hass.states[this.config.humidity_sensor];
    const targetState = this.hass.states[this.config.target_humidity];
    const mistState = this.hass.states[this.config.mist_level];
    const waterState = this.hass.states[this.config.water_sensor];
    const overrideState = this.hass.states[this.config.override_timer];

    if (!humidityState || !targetState || !mistState || !waterState || !overrideState) {
      return html` <ha-card> <div class="card-content">Missing entity configuration</div> </ha-card> `;
    }

    const isUnavailable = humidityState.state === 'unavailable' || humidityState.state === 'unknown';
    const isWaterLow = waterState.state === 'on';
    const isOverrideActive = overrideState.state !== 'Off';

    const mistMin = mistState.attributes?.min ?? this.config.mist_min ?? 1;
    const mistMax = mistState.attributes?.max ?? this.config.mist_max ?? 100;
    const mistCurrent = parseFloat(mistState.state);

    return html`
      <ha-card .header=${this.config.name}>
        <div class="card-content">
          <!-- Current Humidity -->
          <div class="humidity-section">
            <div class="label">${localize('state.current_humidity')}</div>
            <div class="humidity-value ${isUnavailable ? 'unavailable' : ''}">
              ${humidityState.state}${isUnavailable ? '' : '%'}
            </div>
            ${isUnavailable ? html`<div class="unavailable-text">${localize('common.unavailable')}</div>` : ''}
          </div>

          <!-- Low Water Warning -->
          ${isWaterLow
            ? html`
                <div class="water-warning">
                  <ha-icon icon="mdi:water-alert"></ha-icon>
                  <span>${localize('state.low_water')}</span>
                </div>
              `
            : ''}

          <!-- Target Humidity -->
          <div class="control-section">
            <div class="label">${localize('state.target')}</div>
            <div class="slider-container">
              <span class="slider-value">${targetState.state}%</span>
              <input
                type="range"
                .min=${targetState.attributes?.min ?? 25}
                .max=${targetState.attributes?.max ?? 60}
                .step=${targetState.attributes?.step ?? 1}
                .value=${targetState.state}
                @change=${(e: Event) => this._setTargetHumidity((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>

          <!-- Override Timer -->
          <div class="control-section">
            <div class="label">${localize('config.override_timer')}</div>
            <select
              .value=${overrideState.state}
              @change=${(e: Event) => this._setOverrideTimer((e.target as HTMLSelectElement).value)}
            >
              ${overrideState.attributes?.options?.map(
                (option: string) => html` <option value=${option} ?selected=${option === overrideState.state}>
                  ${option}
                </option>`,
              )}
            </select>
          </div>

          <!-- Mist Level -->
          <div class="control-section">
            <div class="label">${localize('state.mist_level')}</div>
            ${this._renderMistIcons(mistCurrent, mistMin, mistMax)}
            ${isOverrideActive
              ? html`
                  <div class="slider-container">
                    <span class="slider-value">${mistCurrent}</span>
                    <input
                      type="range"
                      .min=${mistMin}
                      .max=${mistMax}
                      .step=${mistState.attributes?.step ?? 1}
                      .value=${mistCurrent}
                      @change=${(e: Event) => this._setMistLevel((e.target as HTMLInputElement).value)}
                    />
                  </div>
                `
              : html` <div class="readonly-value">${localize('state.override_off')}</div> `}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderMistIcons(current: number, min: number, max: number): TemplateResult {
    const fillCount = Math.round(((current - min) / (max - min)) * 5);
    const icons = [];

    for (let i = 0; i < 5; i++) {
      icons.push(html` <ha-icon icon=${i < fillCount ? 'mdi:water' : 'mdi:water-outline'}></ha-icon> `);
    }

    return html` <div class="mist-icons">${icons}</div> `;
  }

  private _setTargetHumidity(value: string): void {
    this.hass.callService('input_number', 'set_value', {
      entity_id: this.config.target_humidity,
      value: parseFloat(value),
    });
  }

  private _setMistLevel(value: string): void {
    this.hass.callService('number', 'set_value', {
      entity_id: this.config.mist_level,
      value: parseFloat(value),
    });
  }

  private _setOverrideTimer(option: string): void {
    this.hass.callService('input_select', 'select_option', {
      entity_id: this.config.override_timer,
      option: option,
    });
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
      }

      .card-content {
        padding: 16px;
        display: grid;
        gap: 16px;
      }

      .humidity-section {
        text-align: center;
        padding: 16px 0;
      }

      .humidity-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--primary-text-color);
        margin: 8px 0;
      }

      .humidity-value.unavailable {
        color: var(--secondary-text-color);
        opacity: 0.5;
      }

      .unavailable-text {
        color: var(--secondary-text-color);
        font-size: 0.9rem;
      }

      .water-warning {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        background: var(--warning-color);
        color: white;
        border-radius: 8px;
        font-weight: bold;
      }

      .water-warning ha-icon {
        --mdc-icon-size: 24px;
      }

      .control-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .label {
        font-weight: 500;
        color: var(--secondary-text-color);
        font-size: 0.9rem;
      }

      .slider-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .slider-value {
        min-width: 50px;
        font-weight: bold;
        color: var(--primary-text-color);
      }

      input[type='range'] {
        flex: 1;
        cursor: pointer;
      }

      select {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 1rem;
      }

      .mist-icons {
        display: flex;
        justify-content: center;
        gap: 4px;
        padding: 8px 0;
      }

      .mist-icons ha-icon {
        --mdc-icon-size: 28px;
        color: var(--primary-color);
      }

      .readonly-value {
        text-align: center;
        color: var(--secondary-text-color);
        font-style: italic;
        padding: 8px;
      }
    `;
  }
}
