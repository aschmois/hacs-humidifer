import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, hasConfigOrEntityChanged, LovelaceCardEditor } from 'custom-card-helpers';

import type { HumidifierControlCardConfig } from './types';
import { localize } from './localize/localize';
import './controls/button-control';
import './controls/timer-select-control';

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
      humidity_sensor: entities.find((e) => e.startsWith('sensor.') && e.includes('humidity')),
      target_humidity: entities.find((e) => e.startsWith('input_number.')),
      mist_level: entities.find((e) => e.startsWith('number.')),
      water_sensor: entities.find((e) => e.startsWith('binary_sensor.') && e.includes('water')),
      override_timer: entities.find((e) => e.startsWith('input_select.')),
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
    if (!config.override_timer_options) {
      throw new Error(localize('common.missing_entity') + ': override_timer_options');
    }

    // Get default name from mist_level entity's friendly name (remove entity-specific suffix)
    let defaultName = 'Humidifier';
    if (!config.name && this.hass && config.mist_level) {
      const mistEntity = this.hass.states[config.mist_level];
      if (mistEntity?.attributes?.friendly_name) {
        // Remove common suffixes like "Mist Level", "Level", etc.
        defaultName = mistEntity.attributes.friendly_name
          .replace(/\s+(Mist\s+)?Level$/i, '')
          .trim();
      }
    }

    this.config = {
      name: defaultName,
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, true);
  }

  public getCardSize(): number {
    return 2;
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.config) {
      return html``;
    }

    const humidityState = this.hass.states[this.config.humidity_sensor];
    const targetState = this.hass.states[this.config.target_humidity];
    const mistState = this.hass.states[this.config.mist_level];
    const waterState = this.hass.states[this.config.water_sensor];
    const overrideTimerState = this.hass.states[this.config.override_timer];
    const overrideOptionsState = this.hass.states[this.config.override_timer_options];

    if (!humidityState || !targetState || !mistState || !waterState || !overrideTimerState || !overrideOptionsState) {
      return html` <ha-card> <div class="card-content">Missing entity configuration</div> </ha-card> `;
    }

    const isUnavailable = humidityState.state === 'unavailable' || humidityState.state === 'unknown';
    const isWaterLow = waterState.state === 'on';
    const isTimerActive = overrideTimerState.state !== 'idle';

    const mistMin = mistState.attributes?.min ?? 1;
    const mistMax = mistState.attributes?.max ?? 100;
    const mistCurrent = parseFloat(mistState.state);

    return html`
      <ha-card>
        <div class="card-content">
          <!-- Header with current humidity -->
          <div class="header-row">
            <div class="title-row">
              <ha-icon icon="mdi:air-humidifier"></ha-icon>
              <span class="title">${this.config.name}</span>
            </div>
            ${isWaterLow
              ? html` <ha-icon class="water-alert-icon" icon="mdi:water-alert"></ha-icon> `
              : ''}
            <div class="humidity-display">
              <span class="humidity-value ${isUnavailable ? 'unavailable' : ''}"
                >${humidityState.state}${isUnavailable ? '' : '%'}</span
              >
            </div>
          </div>

          <!-- Target Humidity -->
          <div class="control-row">
            <span class="control-label">${localize('state.target')}</span>
            <humidifier-button-control
              .hass=${this.hass}
              .entity=${this.config.target_humidity}
              .value=${parseFloat(targetState.state)}
              .min=${targetState.attributes?.min ?? 0}
              .max=${targetState.attributes?.max ?? 100}
              .step=${targetState.attributes?.step ?? 1}
              .unit=${'%'}
            ></humidifier-button-control>
          </div>

          <!-- Override Timer -->
          <div class="control-row">
            <span class="control-label">${localize('state.override')}</span>
            <humidifier-timer-select-control
              .hass=${this.hass}
              .entity=${this.config.override_timer_options}
              .value=${overrideOptionsState.state}
              .options=${overrideOptionsState.attributes?.options ?? []}
            ></humidifier-timer-select-control>
          </div>

          <!-- Mist Level -->
          <div class="control-row mist-row">
            <span class="control-label">${localize('state.mist_level')}</span>
            ${isTimerActive
              ? html`
                  <humidifier-button-control
                    .hass=${this.hass}
                    .entity=${this.config.mist_level}
                    .value=${mistCurrent}
                    .min=${mistMin}
                    .max=${mistMax}
                    .step=${mistState.attributes?.step ?? 1}
                    .unit=${''}
                  ></humidifier-button-control>
                `
              : html`<div class="mist-display">${this._renderMistIcons(mistCurrent, mistMin, mistMax)}</div>`}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderMistIcons(current: number, min: number, max: number): TemplateResult {
    const fillCount = Math.round(((current - min) / (max - min)) * 5);
    const icons: TemplateResult[] = [];

    for (let i = 0; i < 5; i++) {
      icons.push(
        html` <ha-icon
          class="mist-icon ${i < fillCount ? 'active' : ''}"
          icon=${i < fillCount ? 'mdi:water' : 'mdi:water-outline'}
        ></ha-icon> `
      );
    }

    return html`${icons}`;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --control-height: 42px;
        --control-border-radius: 12px;
        --rgb-state-humidifier: 33, 150, 243;
      }

      ha-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .card-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Header */
      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .title-row ha-icon {
        --mdc-icon-size: 24px;
        color: rgb(var(--rgb-state-humidifier));
      }

      .title {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .humidity-display {
        display: flex;
        align-items: center;
      }

      .humidity-value {
        font-size: 24px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .humidity-value.unavailable {
        color: var(--secondary-text-color);
        opacity: 0.5;
      }

      /* Water alert icon */
      .water-alert-icon {
        --mdc-icon-size: 24px;
        color: var(--warning-color, #ff9800);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      /* Control rows */
      .control-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .control-label {
        min-width: 80px;
        font-weight: 500;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      humidifier-button-control,
      humidifier-timer-select-control {
        flex: 1;
      }

      /* Mist display */
      .mist-row {
        padding: 4px 0;
      }

      .mist-display {
        display: flex;
        gap: 4px;
        flex: 1;
        justify-content: flex-end;
      }

      .automatic-mode {
        flex: 1;
        text-align: right;
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 14px;
      }

      .mist-icon {
        --mdc-icon-size: 20px;
        color: rgba(var(--rgb-state-humidifier), 0.3);
        transition: color 0.2s;
      }

      .mist-icon.active {
        color: rgb(var(--rgb-state-humidifier));
      }
    `;
  }
}
